import { Credential, GeneralSettings, Integration, NotificationRule, TeamMember } from "../schemas";
import { delay } from "./utils";

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "user-1", name: "Alice Chen", email: "alice@acme.dev", role: "Admin", joinedAt: "2023-01-15T00:00:00Z", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice" },
  { id: "user-2", name: "Bob Martinez", email: "bob@acme.dev", role: "Developer", joinedAt: "2023-03-20T00:00:00Z", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob" },
  { id: "user-3", name: "Charlie Kim", email: "charlie@acme.dev", role: "Developer", joinedAt: "2023-06-01T00:00:00Z", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie" },
  { id: "user-4", name: "Diana Patel", email: "diana@acme.dev", role: "Developer", joinedAt: "2023-08-15T00:00:00Z", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=diana" },
  { id: "user-5", name: "Eve Rodriguez", email: "eve@acme.dev", role: "Viewer", joinedAt: "2024-01-05T00:00:00Z", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve" },
];

export const MOCK_GENERAL_SETTINGS: GeneralSettings = {
  platformName: "Acme KubeOps",
  defaultRegion: "us-east-1",
  defaultBuildTimeout: 600,
};

export const MOCK_CREDENTIALS: Credential[] = [
  { id: "cred-1", name: "prod-deploy-key", type: "ssh_key", value: "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEA...", createdAt: "2023-06-01T00:00:00Z" },
  { id: "cred-2", name: "docker-registry-token", type: "registry_secret", value: "dXNlcjpwYXNz...", createdAt: "2023-08-20T00:00:00Z" },
  { id: "cred-3", name: "github-actions-token", type: "api_token", value: "ghp_xxxxxxxxxxxxxxxxxxxx", createdAt: "2023-11-01T00:00:00Z" },
  { id: "cred-4", name: "staging-deploy-key", type: "ssh_key", value: "-----BEGIN OPENSSH PRIVATE KEY-----\nYWFhYWFhYWFh...", createdAt: "2024-01-10T00:00:00Z" },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: "int-1", name: "GitHub", type: "github", connected: true, accountName: "acme-corp" },
  { id: "int-2", name: "GitLab", type: "gitlab", connected: false },
  { id: "int-3", name: "Slack", type: "slack", connected: true, webhookUrl: "https://hooks.slack.com/services/T00/B00/xxx" },
  { id: "int-4", name: "OCI Registry", type: "oci_registry", connected: true, accountName: "registry.kube.internal" },
];

export const MOCK_NOTIFICATION_RULES: NotificationRule[] = [
  { id: "notif-1", event: "deploy_success", channel: "slack", enabled: true },
  { id: "notif-2", event: "deploy_success", channel: "email", enabled: false },
  { id: "notif-3", event: "deploy_fail", channel: "slack", enabled: true },
  { id: "notif-4", event: "deploy_fail", channel: "email", enabled: true },
  { id: "notif-5", event: "build_fail", channel: "slack", enabled: true },
  { id: "notif-6", event: "build_fail", channel: "email", enabled: false },
];

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  await delay(400, 700);
  return MOCK_TEAM_MEMBERS;
}

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  await delay(300, 500);
  return MOCK_GENERAL_SETTINGS;
}

export async function fetchCredentials(): Promise<Credential[]> {
  await delay(400, 600);
  return MOCK_CREDENTIALS;
}

export async function fetchIntegrations(): Promise<Integration[]> {
  await delay(400, 600);
  return MOCK_INTEGRATIONS;
}

export async function fetchNotificationRules(): Promise<NotificationRule[]> {
  await delay(300, 500);
  return MOCK_NOTIFICATION_RULES;
}
