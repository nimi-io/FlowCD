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

// AppPhase is the current lifecycle phase of an App.
// +kubebuilder:validation:Enum=Pending;Building;Deploying;Healthy;Degraded;Failed;Suspended
type AppPhase string

const (
	AppPhasePending   AppPhase = "Pending"
	AppPhaseBuilding  AppPhase = "Building"
	AppPhaseDeploying AppPhase = "Deploying"
	AppPhaseHealthy   AppPhase = "Healthy"
	AppPhaseDegraded  AppPhase = "Degraded"
	AppPhaseFailed    AppPhase = "Failed"
	AppPhaseSuspended AppPhase = "Suspended"
)

// AppSpec defines the desired state of App.
type AppSpec struct {
	// repoUrl is the URL of the Git repository to deploy from.
	// +required
	// +kubebuilder:validation:MinLength=1
	RepoUrl string `json:"repoUrl"`

	// branch is the Git branch, tag, or commit SHA to deploy.
	// +optional
	// +kubebuilder:default="main"
	Branch string `json:"branch,omitempty"`

	// image is the fully-qualified container image to run (e.g. set by the build pipeline).
	// When empty the controller will not create a Deployment until an image is provided.
	// +optional
	Image string `json:"image,omitempty"`

	// port is the TCP port the container listens on.
	// +optional
	// +kubebuilder:default=8080
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=65535
	Port int32 `json:"port,omitempty"`

	// replicas is the desired number of running pod replicas.
	// +optional
	// +kubebuilder:default=1
	// +kubebuilder:validation:Minimum=0
	Replicas *int32 `json:"replicas,omitempty"`

	// env is a list of environment variables injected into the container.
	// +optional
	Env []AppEnvVar `json:"env,omitempty"`

	// domains is a list of custom hostnames that should be routed to this app.
	// +optional
	Domains []string `json:"domains,omitempty"`

	// suspended temporarily halts reconciliation of this App without deleting it.
	// The Deployment is scaled to zero and the phase is set to Suspended.
	// +optional
	Suspended bool `json:"suspended,omitempty"`

	// destination specifies the target namespace for the workload resources.
	// +optional
	Destination *AppDestination `json:"destination,omitempty"`
}

// AppEnvVar is an environment variable with an optional Secret reference.
type AppEnvVar struct {
	// name of the environment variable.
	// +required
	// +kubebuilder:validation:MinLength=1
	Name string `json:"name"`

	// value is the literal string value (avoid for sensitive data — use secretKeyRef).
	// +optional
	Value string `json:"value,omitempty"`

	// secretKeyRef references a key inside a Kubernetes Secret.
	// +optional
	SecretKeyRef *SecretKeySelector `json:"secretKeyRef,omitempty"`
}

// SecretKeySelector selects a key of a Secret.
type SecretKeySelector struct {
	// name of the Secret resource.
	// +required
	Name string `json:"name"`

	// key within the Secret whose value will be used.
	// +required
	Key string `json:"key"`
}

// AppDestination describes where workload resources are created.
type AppDestination struct {
	// namespace in which Deployment / Service are created.
	// Defaults to the App resource's own namespace when empty.
	// +optional
	Namespace string `json:"namespace,omitempty"`
}

// AppStatus defines the observed state of App.
type AppStatus struct {
	// phase is the high-level lifecycle phase of the App.
	// +optional
	Phase AppPhase `json:"phase,omitempty"`

	// imageTag is the container image tag currently running.
	// +optional
	ImageTag string `json:"imageTag,omitempty"`

	// url is the primary HTTP(S) URL for the deployed application.
	// +optional
	URL string `json:"url,omitempty"`

	// availableReplicas is the number of pods that are available.
	// +optional
	AvailableReplicas int32 `json:"availableReplicas,omitempty"`

	// readyReplicas is the number of pods that are fully ready.
	// +optional
	ReadyReplicas int32 `json:"readyReplicas,omitempty"`

	// lastBuildAt is the timestamp of the last successful image build.
	// +optional
	LastBuildAt *metav1.Time `json:"lastBuildAt,omitempty"`

	// lastDeployedAt is the timestamp of the last successful deployment.
	// +optional
	LastDeployedAt *metav1.Time `json:"lastDeployedAt,omitempty"`

	// conditions represent the current state of the App resource.
	// +listType=map
	// +listMapKey=type
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Phase",type="string",JSONPath=".status.phase"
// +kubebuilder:printcolumn:name="Image",type="string",JSONPath=".status.imageTag"
// +kubebuilder:printcolumn:name="Ready",type="integer",JSONPath=".status.readyReplicas"
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// App is the Schema for the apps API.
type App struct {
	metav1.TypeMeta `json:",inline"`

	// metadata is a standard object metadata.
	// +optional
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// spec defines the desired state of App.
	// +required
	Spec AppSpec `json:"spec"`

	// status defines the observed state of App.
	// +optional
	Status AppStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// AppList contains a list of App
type AppList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitzero"`
	Items           []App `json:"items"`
}

func init() {
	SchemeBuilder.Register(&App{}, &AppList{})
}
