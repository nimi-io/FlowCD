import { z } from "zod";

// ─── Status Types ────────────────────────────────────────────────────────────
export const AppStatusSchema = z.enum(["healthy", "building", "deploying", "degraded", "failed", "idle"]);
export type AppStatus = z.infer<typeof AppStatusSchema>;

export const ArgoSyncStatusSchema = z.enum(["Synced", "OutOfSync", "Unknown"]);
export type ArgoSyncStatus = z.infer<typeof ArgoSyncStatusSchema>;

export const ArgoHealthStatusSchema = z.enum(["Healthy", "Progressing", "Degraded", "Suspended", "Missing", "Unknown"]);
export type ArgoHealthStatus = z.infer<typeof ArgoHealthStatusSchema>;

export const SslStatusSchema = z.enum(["valid", "pending", "failed"]);
export type SslStatus = z.infer<typeof SslStatusSchema>;

export const DeploymentStatusSchema = z.enum(["success", "failed", "in_progress", "rolled_back"]);
export type DeploymentStatus = z.infer<typeof DeploymentStatusSchema>;

export const BuildStatusSchema = z.enum(["success", "failed", "building", "pending"]);
export type BuildStatus = z.infer<typeof BuildStatusSchema>;

export const ClusterHealthSchema = z.enum(["healthy", "degraded", "unreachable"]);
export type ClusterHealth = z.infer<typeof ClusterHealthSchema>;

export const PipelineStatusSchema = z.enum(["succeeded", "failed", "running", "pending"]);
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;

export const TeamRoleSchema = z.enum(["Admin", "Developer", "Viewer"]);
export type TeamRole = z.infer<typeof TeamRoleSchema>;

// ─── Domain Schema ────────────────────────────────────────────────────────────
export const DomainSchema = z.object({
  id: z.string(),
  domain: z.string(),
  sslStatus: SslStatusSchema,
});
export type Domain = z.infer<typeof DomainSchema>;

// ─── EnvVar Schema ────────────────────────────────────────────────────────────
export const EnvVarSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  isSecret: z.boolean(),
});
export type EnvVar = z.infer<typeof EnvVarSchema>;

// ─── App Schema ───────────────────────────────────────────────────────────────
export const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  repoUrl: z.string(),
  branch: z.string(),
  status: AppStatusSchema,
  lastDeployedAt: z.string(),
  lastBuildAt: z.string(),
  url: z.string(),
  imageTag: z.string(),
  argoSyncStatus: ArgoSyncStatusSchema,
  argoHealthStatus: ArgoHealthStatusSchema,
  domains: z.array(DomainSchema),
  envVars: z.array(EnvVarSchema),
});
export type App = z.infer<typeof AppSchema>;

// ─── Deployment Schema ────────────────────────────────────────────────────────
export const DeploymentSchema = z.object({
  id: z.string(),
  appId: z.string(),
  version: z.string(),
  commitSha: z.string(),
  commitMessage: z.string(),
  status: DeploymentStatusSchema,
  triggeredBy: z.string(),
  deployedAt: z.string(),
  duration: z.number(),
  imageTag: z.string(),
});
export type Deployment = z.infer<typeof DeploymentSchema>;

// ─── Build Schema ─────────────────────────────────────────────────────────────
export const BuildSchema = z.object({
  id: z.string(),
  appId: z.string(),
  commitSha: z.string(),
  commitMessage: z.string(),
  status: BuildStatusSchema,
  startedAt: z.string(),
  duration: z.number(),
  logs: z.array(z.string()),
});
export type Build = z.infer<typeof BuildSchema>;

// ─── Cluster Node ─────────────────────────────────────────────────────────────
export const ClusterNodeSchema = z.object({
  name: z.string(),
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  status: z.enum(["Ready", "NotReady", "Unknown"]),
});
export type ClusterNode = z.infer<typeof ClusterNodeSchema>;

export const NamespaceSchema = z.object({
  name: z.string(),
  status: z.enum(["Active", "Terminating"]),
  podCount: z.number(),
  cpuRequest: z.string(),
  memRequest: z.string(),
});
export type Namespace = z.infer<typeof NamespaceSchema>;

// ─── Cluster Schema ───────────────────────────────────────────────────────────
export const ClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(["GKE", "EKS", "AKS", "DigitalOcean", "Bare Metal"]),
  nodeCount: z.number(),
  health: ClusterHealthSchema,
  k8sVersion: z.string(),
  region: z.string(),
  nodes: z.array(ClusterNodeSchema),
  namespaces: z.array(NamespaceSchema),
});
export type Cluster = z.infer<typeof ClusterSchema>;

// ─── Pipeline Stage ───────────────────────────────────────────────────────────
export const PipelineStageSchema = z.object({
  name: z.string(),
  status: PipelineStatusSchema,
  duration: z.number(),
});
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export const PipelineRunSchema = z.object({
  id: z.string(),
  status: PipelineStatusSchema,
  startedAt: z.string(),
  duration: z.number(),
  triggeredBy: z.string(),
});
export type PipelineRun = z.infer<typeof PipelineRunSchema>;

// ─── Pipeline Schema ──────────────────────────────────────────────────────────
export const PipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  appId: z.string(),
  appName: z.string(),
  lastRunStatus: PipelineStatusSchema,
  lastRunAt: z.string(),
  stages: z.array(PipelineStageSchema),
  runs: z.array(PipelineRunSchema),
});
export type Pipeline = z.infer<typeof PipelineSchema>;

// ─── Activity Event Schema ────────────────────────────────────────────────────
export const ActivityEventTypeSchema = z.enum([
  "deploy",
  "rollback",
  "build",
  "config_change",
  "domain_change",
  "scale",
  "cluster_event",
]);
export type ActivityEventType = z.infer<typeof ActivityEventTypeSchema>;

export const ActivityEventSchema = z.object({
  id: z.string(),
  type: ActivityEventTypeSchema,
  appId: z.string().optional(),
  appName: z.string().optional(),
  message: z.string(),
  actor: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.string()).optional(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

// ─── Team Member Schema ───────────────────────────────────────────────────────
export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: TeamRoleSchema,
  joinedAt: z.string(),
  avatarUrl: z.string().optional(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ─── Settings Schemas ─────────────────────────────────────────────────────────
export const GeneralSettingsSchema = z.object({
  platformName: z.string().min(1),
  defaultRegion: z.string(),
  defaultBuildTimeout: z.number().min(60).max(3600),
});
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;

export const CredentialSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["ssh_key", "registry_secret", "api_token"]),
  value: z.string(),
  createdAt: z.string(),
});
export type Credential = z.infer<typeof CredentialSchema>;

export const IntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["github", "gitlab", "slack", "oci_registry"]),
  connected: z.boolean(),
  webhookUrl: z.string().optional(),
  accountName: z.string().optional(),
});
export type Integration = z.infer<typeof IntegrationSchema>;

export const NotificationRuleSchema = z.object({
  id: z.string(),
  event: z.enum(["deploy_success", "deploy_fail", "build_fail"]),
  channel: z.enum(["email", "slack"]),
  enabled: z.boolean(),
});
export type NotificationRule = z.infer<typeof NotificationRuleSchema>;
