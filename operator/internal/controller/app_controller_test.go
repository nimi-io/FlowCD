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
	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	platformv1alpha1 "github.com/nimi-io/FlowCD/operator/api/v1alpha1"
)

var _ = Describe("App Controller", func() {
	const (
		appName   = "test-app"
		namespace = "default"
	)

	ctx := context.Background()
	appNSN := types.NamespacedName{Name: appName, Namespace: namespace}

	// ─── helpers ──────────────────────────────────────────────────────────────

	makeApp := func(image string, domains []string, suspended bool) *platformv1alpha1.App {
		a := &platformv1alpha1.App{
			ObjectMeta: metav1.ObjectMeta{Name: appName, Namespace: namespace},
			Spec: platformv1alpha1.AppSpec{
				RepoUrl:   "https://github.com/example/test-app",
				Branch:    "main",
				Image:     image,
				Domains:   domains,
				Suspended: suspended,
			},
		}
		return a
	}

	reconcileOnce := func() error {
		r := &AppReconciler{Client: k8sClient, Scheme: k8sClient.Scheme()}
		_, err := r.Reconcile(ctx, reconcile.Request{NamespacedName: appNSN})
		return err
	}

	cleanupApp := func() {
		a := &platformv1alpha1.App{}
		if err := k8sClient.Get(ctx, appNSN, a); err == nil {
			// Remove finalizer so deletion proceeds in envtest.
			patch := client.MergeFrom(a.DeepCopy())
			a.Finalizers = nil
			_ = k8sClient.Patch(ctx, a, patch)
			_ = k8sClient.Delete(ctx, a)
		}
		// Also clean up any owned Deployment / Service / Ingress.
		d := &appsv1.Deployment{}
		if err := k8sClient.Get(ctx, appNSN, d); err == nil {
			_ = k8sClient.Delete(ctx, d)
		}
		ingress := &networkingv1.Ingress{}
		if err := k8sClient.Get(ctx, appNSN, ingress); err == nil {
			_ = k8sClient.Delete(ctx, ingress)
		}
	}

	// ─── test cases ───────────────────────────────────────────────────────────

	Context("When no image is set", func() {
		BeforeEach(func() {
			By("creating an App without an image")
			app := makeApp("", nil, false)
			err := k8sClient.Get(ctx, appNSN, &platformv1alpha1.App{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, app)).To(Succeed())
			}
		})

		AfterEach(cleanupApp)

		It("should set status.phase to Pending", func() {
			By("running the reconciler")
			Expect(reconcileOnce()).To(Succeed())

			By("reading the App status")
			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			Expect(app.Status.Phase).To(Equal(platformv1alpha1.AppPhasePending))
		})

		It("should not create a Deployment", func() {
			Expect(reconcileOnce()).To(Succeed())

			d := &appsv1.Deployment{}
			err := k8sClient.Get(ctx, appNSN, d)
			Expect(errors.IsNotFound(err)).To(BeTrue(),
				fmt.Sprintf("expected Deployment to not exist, got err: %v", err))
		})
	})

	Context("When an image is set and the Deployment is not yet ready", func() {
		BeforeEach(func() {
			By("creating an App with an image")
			app := makeApp("ghcr.io/example/test-app:v1.0.0", nil, false)
			err := k8sClient.Get(ctx, appNSN, &platformv1alpha1.App{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, app)).To(Succeed())
			}
		})

		AfterEach(cleanupApp)

		It("should create a Deployment and set phase to Deploying", func() {
			By("running the reconciler")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying a Deployment was created")
			d := &appsv1.Deployment{}
			Expect(k8sClient.Get(ctx, appNSN, d)).To(Succeed())
			Expect(*d.Spec.Replicas).To(Equal(int32(1)))
			Expect(d.Spec.Template.Spec.Containers[0].Image).To(Equal("ghcr.io/example/test-app:v1.0.0"))

			By("verifying phase is Deploying (no replicas ready yet)")
			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			Expect(app.Status.Phase).To(Equal(platformv1alpha1.AppPhaseDeploying))
		})

		It("should set phase to Healthy once all replicas are ready", func() {
			By("reconciling once to create the Deployment")
			Expect(reconcileOnce()).To(Succeed())

			By("patching the Deployment status to simulate readiness")
			d := &appsv1.Deployment{}
			Expect(k8sClient.Get(ctx, appNSN, d)).To(Succeed())
			d.Status.Replicas = 1
			d.Status.ReadyReplicas = 1
			d.Status.AvailableReplicas = 1
			Expect(k8sClient.Status().Update(ctx, d)).To(Succeed())

			By("reconciling again")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying phase is Healthy")
			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			Expect(app.Status.Phase).To(Equal(platformv1alpha1.AppPhaseHealthy))

			cond := meta.FindStatusCondition(app.Status.Conditions, conditionTypeAvailable)
			Expect(cond).NotTo(BeNil())
			Expect(cond.Status).To(Equal(metav1.ConditionTrue))
		})

		It("should set status.imageTag from the image reference", func() {
			Expect(reconcileOnce()).To(Succeed())
			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			Expect(app.Status.ImageTag).To(Equal("v1.0.0"))
		})
	})

	Context("When domains are specified", func() {
		BeforeEach(func() {
			By("creating an App with domains and an image")
			app := makeApp("ghcr.io/example/test-app:latest",
				[]string{"app.example.com", "www.example.com"}, false)
			err := k8sClient.Get(ctx, appNSN, &platformv1alpha1.App{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, app)).To(Succeed())
			}
		})

		AfterEach(cleanupApp)

		It("should create an Ingress with one rule per domain", func() {
			Expect(reconcileOnce()).To(Succeed())

			ingress := &networkingv1.Ingress{}
			Expect(k8sClient.Get(ctx, appNSN, ingress)).To(Succeed())
			Expect(ingress.Spec.Rules).To(HaveLen(2))
			Expect(ingress.Spec.Rules[0].Host).To(Equal("app.example.com"))
			Expect(ingress.Spec.Rules[1].Host).To(Equal("www.example.com"))
		})

		It("should set status.URL to the first domain", func() {
			Expect(reconcileOnce()).To(Succeed())

			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			Expect(app.Status.URL).To(Equal("https://app.example.com"))
		})

		It("should delete the Ingress when domains are removed", func() {
			By("reconciling with domains present")
			Expect(reconcileOnce()).To(Succeed())
			ingress := &networkingv1.Ingress{}
			Expect(k8sClient.Get(ctx, appNSN, ingress)).To(Succeed())

			By("patching the App to remove domains")
			app := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			patch := client.MergeFrom(app.DeepCopy())
			app.Spec.Domains = nil
			Expect(k8sClient.Patch(ctx, app, patch)).To(Succeed())

			By("reconciling again")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying the Ingress no longer exists")
			err := k8sClient.Get(ctx, appNSN, &networkingv1.Ingress{})
			Expect(errors.IsNotFound(err)).To(BeTrue())
		})
	})

	Context("When the App is suspended", func() {
		AfterEach(cleanupApp)

		It("should set phase to Suspended when no Deployment exists yet", func() {
			By("creating a suspended App")
			app := makeApp("ghcr.io/example/test-app:v2", nil, true)
			Expect(k8sClient.Create(ctx, app)).To(Succeed())

			By("reconciling")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying Suspended phase")
			result := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, result)).To(Succeed())
			Expect(result.Status.Phase).To(Equal(platformv1alpha1.AppPhaseSuspended))
		})

		It("should scale an existing Deployment to 0 when suspended", func() {
			By("creating an active App")
			app := makeApp("ghcr.io/example/test-app:v2", nil, false)
			Expect(k8sClient.Create(ctx, app)).To(Succeed())
			Expect(reconcileOnce()).To(Succeed())

			By("verifying deployment was created with 1 replica")
			d := &appsv1.Deployment{}
			Expect(k8sClient.Get(ctx, appNSN, d)).To(Succeed())
			Expect(*d.Spec.Replicas).To(Equal(int32(1)))

			By("suspending the App")
			Expect(k8sClient.Get(ctx, appNSN, app)).To(Succeed())
			patch := client.MergeFrom(app.DeepCopy())
			app.Spec.Suspended = true
			Expect(k8sClient.Patch(ctx, app, patch)).To(Succeed())

			By("reconciling the suspended App")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying Deployment was scaled to 0")
			d = &appsv1.Deployment{}
			Expect(k8sClient.Get(ctx, appNSN, d)).To(Succeed())
			Expect(*d.Spec.Replicas).To(Equal(int32(0)))

			By("verifying phase is Suspended")
			result := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, result)).To(Succeed())
			Expect(result.Status.Phase).To(Equal(platformv1alpha1.AppPhaseSuspended))
		})
	})

	Context("When the Deployment exceeds its progress deadline", func() {
		BeforeEach(func() {
			By("creating an App with an image")
			app := makeApp("ghcr.io/example/test-app:v3", nil, false)
			err := k8sClient.Get(ctx, appNSN, &platformv1alpha1.App{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, app)).To(Succeed())
			}
		})

		AfterEach(cleanupApp)

		It("should set phase to Failed", func() {
			By("reconciling to create the Deployment")
			Expect(reconcileOnce()).To(Succeed())

			By("simulating ProgressDeadlineExceeded on the Deployment")
			d := &appsv1.Deployment{}
			Expect(k8sClient.Get(ctx, appNSN, d)).To(Succeed())
			d.Status.Conditions = []appsv1.DeploymentCondition{
				{
					Type:   appsv1.DeploymentProgressing,
					Status: "False",
					Reason: "ProgressDeadlineExceeded",
				},
			}
			Expect(k8sClient.Status().Update(ctx, d)).To(Succeed())

			By("reconciling again")
			Expect(reconcileOnce()).To(Succeed())

			By("verifying phase is Failed")
			result := &platformv1alpha1.App{}
			Expect(k8sClient.Get(ctx, appNSN, result)).To(Succeed())
			Expect(result.Status.Phase).To(Equal(platformv1alpha1.AppPhaseFailed))

			cond := meta.FindStatusCondition(result.Status.Conditions, conditionTypeDegraded)
			Expect(cond).NotTo(BeNil())
			Expect(cond.Reason).To(Equal("ProgressDeadlineExceeded"))
		})
	})
})
