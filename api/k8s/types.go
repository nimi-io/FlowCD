package k8s

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// GroupVersion for the FlowCD platform CRDs.
var GroupVersion = schema.GroupVersion{Group: "platform.flowcd.io", Version: "v1alpha1"}

// ─── App ─────────────────────────────────────────────────────────────────────

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

type AppEnvVar struct {
	Name  string `json:"name"`
	Value string `json:"value,omitempty"`
}

type AppSpec struct {
	RepoUrl   string      `json:"repoUrl"`
	Branch    string      `json:"branch,omitempty"`
	Image     string      `json:"image,omitempty"`
	Port      int32       `json:"port,omitempty"`
	Replicas  *int32      `json:"replicas,omitempty"`
	Env       []AppEnvVar `json:"env,omitempty"`
	Domains   []string    `json:"domains,omitempty"`
	Suspended bool        `json:"suspended,omitempty"`
}

type AppStatus struct {
	Phase             AppPhase           `json:"phase,omitempty"`
	URL               string             `json:"url,omitempty"`
	ImageTag          string             `json:"imageTag,omitempty"`
	AvailableReplicas int32              `json:"availableReplicas,omitempty"`
	ReadyReplicas     int32              `json:"readyReplicas,omitempty"`
	LastDeployedAt    *metav1.Time       `json:"lastDeployedAt,omitempty"`
	Conditions        []metav1.Condition `json:"conditions,omitempty"`
}

// +kubebuilder:object:root=true
type App struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              AppSpec   `json:"spec,omitempty"`
	Status            AppStatus `json:"status,omitempty"`
}

func (a *App) DeepCopyObject() runtime.Object { c := a.DeepCopy(); return c }
func (a *App) DeepCopy() *App {
	if a == nil {
		return nil
	}
	out := new(App)
	a.DeepCopyInto(out)
	return out
}
func (a *App) DeepCopyInto(out *App) { *out = *a }

// +kubebuilder:object:root=true
type AppList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []App `json:"items"`
}

func (al *AppList) DeepCopyObject() runtime.Object { c := al.DeepCopy(); return c }
func (al *AppList) DeepCopy() *AppList {
	if al == nil {
		return nil
	}
	out := new(AppList)
	out.TypeMeta = al.TypeMeta
	out.ListMeta = al.ListMeta
	out.Items = make([]App, len(al.Items))
	copy(out.Items, al.Items)
	return out
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

type PipelinePhase string

const (
	PipelinePhasePending   PipelinePhase = "Pending"
	PipelinePhaseRunning   PipelinePhase = "Running"
	PipelinePhaseSucceeded PipelinePhase = "Succeeded"
	PipelinePhaseFailed    PipelinePhase = "Failed"
	PipelinePhaseDegraded  PipelinePhase = "Degraded"
	PipelinePhaseSuspended PipelinePhase = "Suspended"
)

type PipelineStageStatus struct {
	Name      string        `json:"name"`
	Phase     PipelinePhase `json:"phase"`
	StartedAt *metav1.Time  `json:"startedAt,omitempty"`
	Duration  string        `json:"duration,omitempty"`
}

type PipelineSpec struct {
	AppRef        string `json:"appRef"`
	DockerfilePath string `json:"dockerfilePath,omitempty"`
	Registry      string `json:"registry,omitempty"`
	ImageName     string `json:"imageName,omitempty"`
	Suspended     bool   `json:"suspended,omitempty"`
}

type PipelineStatus struct {
	Phase           PipelinePhase         `json:"phase,omitempty"`
	CurrentStage    string                `json:"currentStage,omitempty"`
	LastRunAt       *metav1.Time          `json:"lastRunAt,omitempty"`
	LastRunDuration string                `json:"lastRunDuration,omitempty"`
	Stages          []PipelineStageStatus `json:"stages,omitempty"`
	Conditions      []metav1.Condition    `json:"conditions,omitempty"`
}

type Pipeline struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              PipelineSpec   `json:"spec,omitempty"`
	Status            PipelineStatus `json:"status,omitempty"`
}

func (p *Pipeline) DeepCopyObject() runtime.Object { c := p.DeepCopy(); return c }
func (p *Pipeline) DeepCopy() *Pipeline {
	if p == nil {
		return nil
	}
	out := new(Pipeline)
	*out = *p
	return out
}

type PipelineList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Pipeline `json:"items"`
}

func (pl *PipelineList) DeepCopyObject() runtime.Object { c := pl.DeepCopy(); return c }
func (pl *PipelineList) DeepCopy() *PipelineList {
	if pl == nil {
		return nil
	}
	out := new(PipelineList)
	out.TypeMeta = pl.TypeMeta
	out.ListMeta = pl.ListMeta
	out.Items = make([]Pipeline, len(pl.Items))
	copy(out.Items, pl.Items)
	return out
}
