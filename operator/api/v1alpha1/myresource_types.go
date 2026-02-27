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

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PipelinePhase is the lifecycle phase of a Pipeline.
// +kubebuilder:validation:Enum=Pending;Running;Succeeded;Failed;Suspended
type PipelinePhase string

const (
	PipelinePhasePending   PipelinePhase = "Pending"
	PipelinePhaseRunning   PipelinePhase = "Running"
	PipelinePhaseSucceeded PipelinePhase = "Succeeded"
	PipelinePhaseFailed    PipelinePhase = "Failed"
	PipelinePhaseSuspended PipelinePhase = "Suspended"
)

// PipelineSpec defines the desired state of Pipeline.
type PipelineSpec struct {
	// appRef is the name of the App resource in the same namespace that this
	// pipeline delivers to. On a successful build the controller writes the
	// new image back to App.spec.image.
	// +required
	// +kubebuilder:validation:MinLength=1
	AppRef string `json:"appRef"`

	// dockerfilePath is the relative path to the Dockerfile inside the repo.
	// +optional
	// +kubebuilder:default="Dockerfile"
	DockerfilePath string `json:"dockerfilePath,omitempty"`

	// registry is the container registry URL to push built images to
	// (e.g. "ghcr.io/myorg").
	// +required
	// +kubebuilder:validation:MinLength=1
	Registry string `json:"registry"`

	// imageName is the image repository name (without the registry prefix).
	// +required
	// +kubebuilder:validation:MinLength=1
	ImageName string `json:"imageName"`

	// buildArgs are additional --build-arg values passed to docker build.
	// +optional
	BuildArgs []BuildArg `json:"buildArgs,omitempty"`

	// suspended temporarily halts pipeline reconciliation without deleting
	// the resource.
	// +optional
	Suspended bool `json:"suspended,omitempty"`
}

// BuildArg is a key/value pair forwarded as a Docker build argument.
type BuildArg struct {
	// name of the build argument.
	// +required
	Name string `json:"name"`

	// value of the build argument.
	// +required
	Value string `json:"value"`
}

// PipelineStageStatus captures the observed result of a single pipeline stage.
type PipelineStageStatus struct {
	// name of the stage.
	Name string `json:"name"`

	// phase is the outcome of this stage.
	Phase PipelinePhase `json:"phase"`

	// duration is the wall-clock duration of the stage in seconds.
	// +optional
	Duration int64 `json:"duration,omitempty"`
}

// PipelineStatus defines the observed state of Pipeline.
type PipelineStatus struct {
	// phase is the high-level lifecycle phase of the Pipeline.
	// +optional
	Phase PipelinePhase `json:"phase,omitempty"`

	// currentStage is the name of the stage currently executing.
	// +optional
	CurrentStage string `json:"currentStage,omitempty"`

	// lastRunAt is the timestamp when the most recent run started.
	// +optional
	LastRunAt *metav1.Time `json:"lastRunAt,omitempty"`

	// lastRunDuration is the wall-clock duration of the most recent run in
	// seconds.
	// +optional
	LastRunDuration int64 `json:"lastRunDuration,omitempty"`

	// stages contains per-stage status entries for the most recent run.
	// +optional
	Stages []PipelineStageStatus `json:"stages,omitempty"`

	// conditions represent the current state of the Pipeline resource.
	// +listType=map
	// +listMapKey=type
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="App",type="string",JSONPath=".spec.appRef"
// +kubebuilder:printcolumn:name="Phase",type="string",JSONPath=".status.phase"
// +kubebuilder:printcolumn:name="Stage",type="string",JSONPath=".status.currentStage"
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// Pipeline is the Schema for the pipelines API.
type Pipeline struct {
	metav1.TypeMeta `json:",inline"`

	// metadata is standard object metadata.
	// +optional
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// spec defines the desired state of Pipeline.
	// +required
	Spec PipelineSpec `json:"spec"`

	// status defines the observed state of Pipeline.
	// +optional
	Status PipelineStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// PipelineList contains a list of Pipeline.
type PipelineList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Pipeline `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Pipeline{}, &PipelineList{})
}
