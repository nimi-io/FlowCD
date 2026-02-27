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

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	platformv1alpha1 "github.com/nimi-io/FlowCD/operator/api/v1alpha1"
)

var _ = Describe("Pipeline Controller", func() {
	const (
		pipelineName = "test-pipeline"
		appName      = "test-app-for-pipeline"
		namespace    = "default"
	)

	ctx := context.Background()

	pipelineNSN := types.NamespacedName{Name: pipelineName, Namespace: namespace}
	appNSN := types.NamespacedName{Name: appName, Namespace: namespace}

	// ─── helpers ──────────────────────────────────────────────────────────────

	makePipeline := func(appRef string, suspended bool) *platformv1alpha1.Pipeline {
		return &platformv1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{Name: pipelineName, Namespace: namespace},
			Spec: platformv1alpha1.PipelineSpec{
				AppRef:    appRef,
				Registry:  "ghcr.io/myorg",
				ImageName: "test-app",
				Suspended: suspended,
			},
		}
	}

	makeApp := func() *platformv1alpha1.App {
		return &platformv1alpha1.App{
			ObjectMeta: metav1.ObjectMeta{Name: appName, Namespace: namespace},
			Spec: platformv1alpha1.AppSpec{
				RepoUrl: "https://github.com/example/app",
				Branch:  "main",
			},
		}
	}

	reconcileOnce := func() error {
		r := &PipelineReconciler{Client: k8sClient, Scheme: k8sClient.Scheme()}
		_, err := r.Reconcile(ctx, reconcile.Request{NamespacedName: pipelineNSN})
		return err
	}

	// ─── test cases ───────────────────────────────────────────────────────────

	Context("When the referenced App exists", func() {
		BeforeEach(func() {
			By("creating the backing App")
			app := makeApp()
			err := k8sClient.Get(ctx, appNSN, &platformv1alpha1.App{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, app)).To(Succeed())
			}

			By("creating the Pipeline")
			pipeline := makePipeline(appName, false)
			err = k8sClient.Get(ctx, pipelineNSN, &platformv1alpha1.Pipeline{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, pipeline)).To(Succeed())
			}
		})

		AfterEach(func() {
			By("deleting the Pipeline")
			p := &platformv1alpha1.Pipeline{}
			if err := k8sClient.Get(ctx, pipelineNSN, p); err == nil {
				Expect(k8sClient.Delete(ctx, p)).To(Succeed())
			}
			By("deleting the App")
			a := &platformv1alpha1.App{}
			if err := k8sClient.Get(ctx, appNSN, a); err == nil {
				Expect(k8sClient.Delete(ctx, a)).To(Succeed())
			}
		})

		It("should set Ready condition and Pending phase", func() {
			By("running the reconciler")
			Expect(reconcileOnce()).To(Succeed())

			By("checking the Pipeline status")
			pipeline := &platformv1alpha1.Pipeline{}
			Expect(k8sClient.Get(ctx, pipelineNSN, pipeline)).To(Succeed())

			Expect(pipeline.Status.Phase).To(Equal(platformv1alpha1.PipelinePhasePending))

			cond := meta.FindStatusCondition(pipeline.Status.Conditions, pipelineConditionReady)
			Expect(cond).NotTo(BeNil())
			Expect(cond.Status).To(Equal(metav1.ConditionTrue))
			Expect(cond.Reason).To(Equal("Configured"))
		})
	})

	Context("When the referenced App does NOT exist", func() {
		BeforeEach(func() {
			By("creating a Pipeline with a non-existent appRef")
			pipeline := makePipeline("does-not-exist", false)
			err := k8sClient.Get(ctx, pipelineNSN, &platformv1alpha1.Pipeline{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, pipeline)).To(Succeed())
			}
		})

		AfterEach(func() {
			p := &platformv1alpha1.Pipeline{}
			if err := k8sClient.Get(ctx, pipelineNSN, p); err == nil {
				Expect(k8sClient.Delete(ctx, p)).To(Succeed())
			}
		})

		It("should set Degraded phase with AppNotFound condition", func() {
			By("running the reconciler")
			Expect(reconcileOnce()).To(Succeed())

			By("checking the Pipeline status")
			pipeline := &platformv1alpha1.Pipeline{}
			Expect(k8sClient.Get(ctx, pipelineNSN, pipeline)).To(Succeed())

			Expect(pipeline.Status.Phase).To(Equal(platformv1alpha1.PipelinePhaseDegraded))

			cond := meta.FindStatusCondition(pipeline.Status.Conditions, pipelineConditionDegraded)
			Expect(cond).NotTo(BeNil())
			Expect(cond.Status).To(Equal(metav1.ConditionTrue))
			Expect(cond.Reason).To(Equal("AppNotFound"))
		})
	})

	Context("When the Pipeline is suspended", func() {
		BeforeEach(func() {
			By("creating a suspended Pipeline")
			pipeline := makePipeline(appName, true)
			err := k8sClient.Get(ctx, pipelineNSN, &platformv1alpha1.Pipeline{})
			if errors.IsNotFound(err) {
				Expect(k8sClient.Create(ctx, pipeline)).To(Succeed())
			}
		})

		AfterEach(func() {
			p := &platformv1alpha1.Pipeline{}
			if err := k8sClient.Get(ctx, pipelineNSN, p); err == nil {
				Expect(k8sClient.Delete(ctx, p)).To(Succeed())
			}
		})

		It("should set Suspended phase", func() {
			By("running the reconciler")
			Expect(reconcileOnce()).To(Succeed())

			By("checking the Pipeline status")
			pipeline := &platformv1alpha1.Pipeline{}
			Expect(k8sClient.Get(ctx, pipelineNSN, pipeline)).To(Succeed())

			Expect(pipeline.Status.Phase).To(Equal(platformv1alpha1.PipelinePhaseSuspended))
		})
	})
})
