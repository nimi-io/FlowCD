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

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	logf "sigs.k8s.io/controller-runtime/pkg/log"

	platformv1alpha1 "github.com/nimi-io/FlowCD/operator/api/v1alpha1"
)

const (
	pipelineFinalizer = "platform.flowcd.io/pipeline-finalizer"

	pipelineConditionReady       = "Ready"
	pipelineConditionProgressing = "Progressing"
	pipelineConditionDegraded    = "Degraded"
)

// PipelineReconciler reconciles a Pipeline object.
type PipelineReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=platform.flowcd.io,resources=pipelines,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=platform.flowcd.io,resources=pipelines/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=platform.flowcd.io,resources=pipelines/finalizers,verbs=update

// Reconcile moves the current cluster state toward the desired state declared in Pipeline.
func (r *PipelineReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	// 1. Fetch the Pipeline instance.
	pipeline := &platformv1alpha1.Pipeline{}
	if err := r.Get(ctx, req.NamespacedName, pipeline); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	// 2. Handle deletion.
	if !pipeline.DeletionTimestamp.IsZero() {
		if controllerutil.ContainsFinalizer(pipeline, pipelineFinalizer) {
			log.Info("Running cleanup for Pipeline deletion", "name", pipeline.Name)
			controllerutil.RemoveFinalizer(pipeline, pipelineFinalizer)
			if err := r.Update(ctx, pipeline); err != nil {
				return ctrl.Result{}, err
			}
		}
		return ctrl.Result{}, nil
	}

	// 3. Register finalizer.
	if !controllerutil.ContainsFinalizer(pipeline, pipelineFinalizer) {
		controllerutil.AddFinalizer(pipeline, pipelineFinalizer)
		if err := r.Update(ctx, pipeline); err != nil {
			return ctrl.Result{}, err
		}
	}

	// 4. Handle suspended pipelines.
	if pipeline.Spec.Suspended {
		log.Info("Pipeline is suspended", "name", pipeline.Name)
		return r.setPipelinePhase(ctx, pipeline, platformv1alpha1.PipelinePhaseSuspended, "Pipeline is suspended.")
	}

	// 5. Validate that the referenced App exists.
	app := &platformv1alpha1.App{}
	err := r.Get(ctx, types.NamespacedName{Name: pipeline.Spec.AppRef, Namespace: pipeline.Namespace}, app)
	if apierrors.IsNotFound(err) {
		msg := fmt.Sprintf("App %q not found in namespace %q.", pipeline.Spec.AppRef, pipeline.Namespace)
		log.Info(msg, "pipeline", pipeline.Name)
		return r.setPipelineDegraded(ctx, pipeline, "AppNotFound", msg)
	}
	if err != nil {
		return ctrl.Result{}, fmt.Errorf("get App %q: %w", pipeline.Spec.AppRef, err)
	}

	// 6. Pipeline is configured correctly — mark it Ready/Pending (no build
	//    engine wired yet; a future build controller will drive phase
	//    transitions to Running/Succeeded/Failed).
	patch := client.MergeFrom(pipeline.DeepCopy())
	if pipeline.Status.Phase == "" || pipeline.Status.Phase == platformv1alpha1.PipelinePhaseDegraded {
		pipeline.Status.Phase = platformv1alpha1.PipelinePhasePending
	}
	meta.SetStatusCondition(&pipeline.Status.Conditions, metav1.Condition{
		Type:               pipelineConditionReady,
		Status:             metav1.ConditionTrue,
		Reason:             "Configured",
		Message:            fmt.Sprintf("Pipeline is configured and references App %q.", pipeline.Spec.AppRef),
		ObservedGeneration: pipeline.Generation,
	})
	meta.SetStatusCondition(&pipeline.Status.Conditions, metav1.Condition{
		Type:               pipelineConditionDegraded,
		Status:             metav1.ConditionFalse,
		Reason:             "Configured",
		Message:            "No errors detected.",
		ObservedGeneration: pipeline.Generation,
	})
	if err := r.Status().Patch(ctx, pipeline, patch); err != nil {
		return ctrl.Result{}, err
	}
	return ctrl.Result{}, nil
}

// setPipelinePhase patches status.phase and a progressing condition.
func (r *PipelineReconciler) setPipelinePhase(ctx context.Context, pipeline *platformv1alpha1.Pipeline, phase platformv1alpha1.PipelinePhase, msg string) (ctrl.Result, error) {
	patch := client.MergeFrom(pipeline.DeepCopy())
	pipeline.Status.Phase = phase
	meta.SetStatusCondition(&pipeline.Status.Conditions, metav1.Condition{
		Type:               pipelineConditionProgressing,
		Status:             metav1.ConditionTrue,
		Reason:             string(phase),
		Message:            msg,
		ObservedGeneration: pipeline.Generation,
	})
	return ctrl.Result{}, r.Status().Patch(ctx, pipeline, patch)
}

// setPipelineDegraded patches a Degraded condition and returns.
func (r *PipelineReconciler) setPipelineDegraded(ctx context.Context, pipeline *platformv1alpha1.Pipeline, reason, msg string) (ctrl.Result, error) {
	patch := client.MergeFrom(pipeline.DeepCopy())
	pipeline.Status.Phase = platformv1alpha1.PipelinePhaseDegraded
	meta.SetStatusCondition(&pipeline.Status.Conditions, metav1.Condition{
		Type:               pipelineConditionDegraded,
		Status:             metav1.ConditionTrue,
		Reason:             reason,
		Message:            msg,
		ObservedGeneration: pipeline.Generation,
	})
	meta.SetStatusCondition(&pipeline.Status.Conditions, metav1.Condition{
		Type:               pipelineConditionReady,
		Status:             metav1.ConditionFalse,
		Reason:             reason,
		Message:            msg,
		ObservedGeneration: pipeline.Generation,
	})
	return ctrl.Result{}, r.Status().Patch(ctx, pipeline, patch)
}

// SetupWithManager sets up the controller with the Manager.
func (r *PipelineReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&platformv1alpha1.Pipeline{}).
		Named("pipeline").
		Complete(r)
}
