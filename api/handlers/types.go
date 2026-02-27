package handlers

import "time"

// ─── App ─────────────────────────────────────────────────────────────────────

type DomainResp struct {
	ID        string `json:"id"`
	Domain    string `json:"domain"`
	SslStatus string `json:"sslStatus"`
}

type EnvVarResp struct {
	ID       string `json:"id"`
	Key      string `json:"key"`
	Value    string `json:"value"`
	IsSecret bool   `json:"isSecret"`
}

type AppResp struct {
	ID               string       `json:"id"`
	Name             string       `json:"name"`
	RepoUrl          string       `json:"repoUrl"`
	Branch           string       `json:"branch"`
	Status           string       `json:"status"`
	LastDeployedAt   string       `json:"lastDeployedAt"`
	LastBuildAt      string       `json:"lastBuildAt"`
	URL              string       `json:"url"`
	ImageTag         string       `json:"imageTag"`
	ArgoSyncStatus   string       `json:"argoSyncStatus"`
	ArgoHealthStatus string       `json:"argoHealthStatus"`
	Domains          []DomainResp `json:"domains"`
	EnvVars          []EnvVarResp `json:"envVars"`
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

type PipelineStageResp struct {
	Name     string  `json:"name"`
	Status   string  `json:"status"`
	Duration float64 `json:"duration"`
}

type PipelineRunResp struct {
	ID          string `json:"id"`
	Status      string `json:"status"`
	StartedAt   string `json:"startedAt"`
	Duration    float64 `json:"duration"`
	TriggeredBy string `json:"triggeredBy"`
}

type PipelineResp struct {
	ID            string              `json:"id"`
	Name          string              `json:"name"`
	AppID         string              `json:"appId"`
	AppName       string              `json:"appName"`
	LastRunStatus string              `json:"lastRunStatus"`
	LastRunAt     string              `json:"lastRunAt"`
	Stages        []PipelineStageResp `json:"stages"`
	Runs          []PipelineRunResp   `json:"runs"`
}

// ─── Cluster (stub) ─────────────────────────────────────────────────────────

type ClusterNodeResp struct {
	Name   string `json:"name"`
	CPU    int    `json:"cpu"`
	Memory int    `json:"memory"`
	Status string `json:"status"`
}

type NamespaceResp struct {
	Name       string `json:"name"`
	Status     string `json:"status"`
	PodCount   int    `json:"podCount"`
	CPURequest string `json:"cpuRequest"`
	MemRequest string `json:"memRequest"`
}

type ClusterResp struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Provider   string            `json:"provider"`
	NodeCount  int               `json:"nodeCount"`
	Health     string            `json:"health"`
	K8sVersion string            `json:"k8sVersion"`
	Region     string            `json:"region"`
	Nodes      []ClusterNodeResp `json:"nodes"`
	Namespaces []NamespaceResp   `json:"namespaces"`
}

// ─── Activity ─────────────────────────────────────────────────────────────────

type ActivityEventResp struct {
	ID        string            `json:"id"`
	Type      string            `json:"type"`
	AppID     string            `json:"appId,omitempty"`
	AppName   string            `json:"appName,omitempty"`
	Message   string            `json:"message"`
	Actor     string            `json:"actor"`
	Timestamp string            `json:"timestamp"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type ActivityPageResp struct {
	Events  []ActivityEventResp `json:"events"`
	HasMore bool                `json:"hasMore"`
}

// ─── Settings ─────────────────────────────────────────────────────────────────

type TeamMemberResp struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	JoinedAt  string `json:"joinedAt"`
	AvatarUrl string `json:"avatarUrl,omitempty"`
}

type GeneralSettingsResp struct {
	PlatformName        string `json:"platformName"`
	DefaultRegion       string `json:"defaultRegion"`
	DefaultBuildTimeout int    `json:"defaultBuildTimeout"`
}

type CredentialResp struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Value     string `json:"value"`
	CreatedAt string `json:"createdAt"`
}

type IntegrationResp struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"`
	Connected   bool   `json:"connected"`
	WebhookUrl  string `json:"webhookUrl,omitempty"`
	AccountName string `json:"accountName,omitempty"`
}

type NotificationRuleResp struct {
	ID      string `json:"id"`
	Event   string `json:"event"`
	Channel string `json:"channel"`
	Enabled bool   `json:"enabled"`
}

// sentinel to avoid unused import
var _ = time.Now
