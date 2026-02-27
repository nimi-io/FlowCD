/*
Copyright 2026.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/intstr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	logf "sigs.k8s.io/controller-runtime/pkg/log"

	platformv1alpha1 "github.com/nimi-io/FlowCD/operator/api/v1alpha1"
)

const (
	appFinalizer = "platform.flowcd.io/finalizer"

	conditionTypeAvailable   = "Available"
	conditionTypeProgressing = "Progressing"
	conditionTypeDegraded    = "Degraded"
)

// AppReconciler reconciles a App object
type AppReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=platform.flowcd.io,resources=apps,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=platform.flowcd.io,resources=apps/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=platform.flowcd.io,resources=apps/finalizers,verbs=update
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=pods,verbs=get;list;watch

// Reconcile moves the current cluster state toward the desired state declared in App.
func (r *AppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	// 1. Fetch the App instance.
	app := &platformv1alpha1.App{}
	if err := r.Get(ctx, req.NamespacedName, app); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	// 2. Handle deletion — run cleanup logic then remove the finalizer.
	if !app.DeletionTimestamp.IsZero() {
		if controllerutil.ContainsFinalizer(app, appFinalizer) {
			log.Info("Running cleanup for App deletion", "name", app.Name)
			// (Future: delete ArgoCD Application, external DNS, etc.)
			controllerutil.RemoveFinalizer(app, appFinalizer)
			if err := r.Update(ctx, app); err != nil {
				return ctrl.Result{}, err
			}
		}
		return ctrl.Result{}, nil
	}

	// 3. Ensure our finalizer is registered.
	if !controllerutil.ContainsFinalizer(app, appFinalizer) {
		controllerutil.AddFinalizer(app, appFinalizer)
		if err := r.Update(ctx, app); err != nil {
			return ctrl.Result{}, err
		}
	}

	// 4. If no image has been set yet, wait in Pending phase.
	if app.Spec.Image == "" {
		log.Info("No image set — waiting for build pipeline", "name", app.Name)
		return r.setPhase(ctx, app, platformv1alpha1.AppPhasePending, "No image configured; waiting for build pipeline.")
	}

	// 5. Determine the target namespace.
	targetNamespace := app.Namespace
	if app.Spec.Destination != nil && app.Spec.Destination.Namespace != "" {
		targetNamespace = app.Spec.Destination.Namespace
	}

	// 6. Reconcile Deployment.
	deployment, err := r.reconcileDeployment(ctx, app, targetNamespace)
	if err != nil {
		_ = r.setDegradedCondition(ctx, app, "DeploymentFailed", err.Error())
		return ctrl.Result{}, err
	}

	// 7. Reconcile Service.
	if err := r.reconcileService(ctx, app, targetNamespace); err != nil {
		_ = r.setDegradedCondition(ctx, app, "ServiceFailed", err.Error())
		return ctrl.Result{}, err
	}

	// 8. Sync status from the Deployment.
	return r.syncStatus(ctx, app, deployment)
}

// reconcileDeployment creates or updates the Deployment owned by this App.
func (r *AppReconciler) reconcileDeployment(ctx context.Context, app *platformv1alpha1.App, namespace string) (*appsv1.Deployment, error) {
	replicas := int32(1)
	if app.Spec.Replicas != nil {
		replicas = *app.Spec.Replicas
	}
	port := app.Spec.Port
	if port == 0 {
		port = 8080
	}

	labels := appLabels(app.Name)

	// Build container env from spec.
	envVars := make([]corev1.EnvVar, 0, len(app.Spec.Env))
	for _, e := range app.Spec.Env {
		ev := corev1.EnvVar{Name: e.Name}
		if e.SecretKeyRef != nil {
			ev.ValueFrom = &corev1.EnvVarSource{
				SecretKeyRef: &corev1.SecretKeySelector{
					LocalObjectReference: corev1.LocalObjectReference{Name: e.SecretKeyRef.Name},
					Key:                  e.SecretKeyRef.Key,
				},
			}
		} else {
			ev.Value = e.Value
		}
		envVars = append(envVars, ev)
	}

	desired := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      app.Name,
			Namespace: namespace,
			Labels:    labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{MatchLabels: labels},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{Labels: labels},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  app.Name,
							Image: app.Spec.Image,
							Ports: []corev1.ContainerPort{
								{Name: "http", ContainerPort: port, Protocol: corev1.ProtocolTCP},
							},
							Env: envVars,
							ReadinessProbe: &corev1.Probe{
								ProbeHandler: corev1.ProbeHandler{
									TCPSocket: &corev1.TCPSocketAction{
										Port: intstr.FromInt32(port),
									},
								},
								InitialDelaySeconds: 5,
								PeriodSeconds:       10,
							},
							LivenessProbe: &corev1.Probe{
								ProbeHandler: corev1.ProbeHandler{
									TCPSocket: &corev1.TCPSocketAction{
										Port: intstr.FromInt32(port),
									},
								},
								InitialDelaySeconds: 15,
								PeriodSeconds:       20,
							},
						},
					},
				},
			},
		},
	}

	// Only set owner reference when Deployment is in the same namespace.
	if namespace == app.Namespace {
		if err := controllerutil.SetControllerReference(app, desired, r.Scheme); err != nil {
			return nil, fmt.Errorf("set owner reference: %w", err)
		}
	}

	existing := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: app.Name, Namespace: namespace}, existing)
	if apierrors.IsNotFound(err) {
		if err := r.Create(ctx, desired); err != nil {
			return nil, fmt.Errorf("create Deployment: %w", err)
		}
		return desired, nil
	}
	if err != nil {
		return nil, err
	}

	// Patch: update image, replicas, and env.
	patch := client.MergeFrom(existing.DeepCopy())
	existing.Spec.Replicas = desired.Spec.Replicas
	existing.Spec.Template.Spec.Containers[0].Image = desired.Spec.Template.Spec.Containers[0].Image
	existing.Spec.Template.Spec.Containers[0].Env = desired.Spec.Template.Spec.Containers[0].Env
	if err := r.Patch(ctx, existing, patch); err != nil {
		return nil, fmt.Errorf("patch Deployment: %w", err)
	}
	return existing, nil
}

// reconcileService creates or updates a ClusterIP Service for the App.
func (r *AppReconciler) reconcileService(ctx context.Context, app *platformv1alpha1.App, namespace string) error {
	port := app.Spec.Port
	if port == 0 {
		port = 8080
	}
	labels := appLabels(app.Name)

	desired := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      app.Name,
			Namespace: namespace,
			Labels:    labels,
		},
		Spec: corev1.ServiceSpec{
			Selector: labels,
			Ports: []corev1.ServicePort{
				{
					Name:       "http",
					Port:       port,
					TargetPort: intstr.FromInt32(port),
					Protocol:   corev1.ProtocolTCP,
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	if namespace == app.Namespace {
		if err := controllerutil.SetControllerReference(app, desired, r.Scheme); err != nil {
			return fmt.Errorf("set owner reference: %w", err)
		}
	}

	existing := &corev1.Service{}
	err := r.Get(ctx, types.NamespacedName{Name: app.Name, Namespace: namespace}, existing)
	if apierrors.IsNotFound(err) {
		return r.Create(ctx, desired)
	}
	if err != nil {
		return err
	}

	patch := client.MergeFrom(existing.DeepCopy())
	existing.Spec.Ports = desired.Spec.Ports
	existing.Spec.Selector = desired.Spec.Selector
	return r.Patch(ctx, existing, patch)
}

// syncStatus reads the Deployment state and reflects it back onto App.Status.
func (r *AppReconciler) syncStatus(ctx context.Context, app *platformv1alpha1.App, deployment *appsv1.Deployment) (ctrl.Result, error) {
	patch := client.MergeFrom(app.DeepCopy())

	app.Status.AvailableReplicas = deployment.Status.AvailableReplicas
	app.Status.ReadyReplicas = deployment.Status.ReadyReplicas
	app.Status.ImageTag = imageTag(app.Spec.Image)

	desiredReplicas := int32(1)
	if app.Spec.Replicas != nil {
		desiredReplicas = *app.Spec.Replicas
	}

	switch {
	case deployment.Status.ReadyReplicas == desiredReplicas:
		app.Status.Phase = platformv1alpha1.AppPhaseHealthy
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeAvailable,
			Status:             metav1.ConditionTrue,
			Reason:             "DeploymentReady",
			Message:            fmt.Sprintf("Deployment has %d/%d replicas ready.", deployment.Status.ReadyReplicas, desiredReplicas),
			ObservedGeneration: app.Generation,
		})
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeProgressing,
			Status:             metav1.ConditionFalse,
			Reason:             "DeploymentReady",
			Message:            "Rollout complete.",
			ObservedGeneration: app.Generation,
		})
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeDegraded,
			Status:             metav1.ConditionFalse,
			Reason:             "DeploymentReady",
			Message:            "All replicas are healthy.",
			ObservedGeneration: app.Generation,
		})
		now := metav1.Now()
		app.Status.LastDeployedAt = &now

	case deployment.Status.AvailableReplicas < desiredReplicas:
		app.Status.Phase = platformv1alpha1.AppPhaseDeploying
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeProgressing,
			Status:             metav1.ConditionTrue,
			Reason:             "DeploymentProgressing",
			Message:            fmt.Sprintf("Waiting for replicas: %d/%d ready.", deployment.Status.ReadyReplicas, desiredReplicas),
			ObservedGeneration: app.Generation,
		})
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeAvailable,
			Status:             metav1.ConditionFalse,
			Reason:             "DeploymentProgressing",
			Message:            "Deployment is not yet fully available.",
			ObservedGeneration: app.Generation,
		})

	default:
		app.Status.Phase = platformv1alpha1.AppPhaseDegraded
		meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
			Type:               conditionTypeDegraded,
			Status:             metav1.ConditionTrue,
			Reason:             "DeploymentDegraded",
			Message:            fmt.Sprintf("Only %d/%d replicas available.", deployment.Status.AvailableReplicas, desiredReplicas),
			ObservedGeneration: app.Generation,
		})
	}

	if err := r.Status().Patch(ctx, app, patch); err != nil {
		return ctrl.Result{}, err
	}

	// Re-queue while deploying so we pick up replica changes.
	if app.Status.Phase == platformv1alpha1.AppPhaseDeploying {
		return ctrl.Result{RequeueAfter: 5_000_000_000}, nil // 5 s
	}
	return ctrl.Result{}, nil
}

// setPhase is a helper to patch status.phase + a progressing condition and return.
func (r *AppReconciler) setPhase(ctx context.Context, app *platformv1alpha1.App, phase platformv1alpha1.AppPhase, msg string) (ctrl.Result, error) {
	patch := client.MergeFrom(app.DeepCopy())
	app.Status.Phase = phase
	meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
		Type:               conditionTypeProgressing,
		Status:             metav1.ConditionTrue,
		Reason:             string(phase),
		Message:            msg,
		ObservedGeneration: app.Generation,
	})
	return ctrl.Result{}, r.Status().Patch(ctx, app, patch)
}

// setDegradedCondition patches a Degraded condition onto the App status.
func (r *AppReconciler) setDegradedCondition(ctx context.Context, app *platformv1alpha1.App, reason, msg string) error {
	patch := client.MergeFrom(app.DeepCopy())
	app.Status.Phase = platformv1alpha1.AppPhaseDegraded
	meta.SetStatusCondition(&app.Status.Conditions, metav1.Condition{
		Type:               conditionTypeDegraded,
		Status:             metav1.ConditionTrue,
		Reason:             reason,
		Message:            msg,
		ObservedGeneration: app.Generation,
	})
	return r.Status().Patch(ctx, app, patch)
}

// appLabels returns a standard label set for all resources owned by an App.
func appLabels(name string) map[string]string {
	return map[string]string{
		"app.kubernetes.io/name":       name,
		"app.kubernetes.io/managed-by": "flowcd-operator",
	}
}

// imageTag extracts the tag portion of a fully-qualified image reference.
func imageTag(image string) string {
	for i := len(image) - 1; i >= 0; i-- {
		if image[i] == ':' {
			return image[i+1:]
		}
	}
	return image
}

// SetupWithManager sets up the controller with the Manager.
func (r *AppReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&platformv1alpha1.App{}).
		Owns(&appsv1.Deployment{}).
		Owns(&corev1.Service{}).
		Named("app").
		Complete(r)
}
