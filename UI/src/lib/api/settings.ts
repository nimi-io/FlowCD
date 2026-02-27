import {
  fetchCredentials,
  fetchGeneralSettings,
  fetchIntegrations,
  fetchNotificationRules,
  fetchTeamMembers,
} from "../mock/settings";
import {
  Credential,
  GeneralSettings,
  Integration,
  NotificationRule,
  TeamMember,
} from "../schemas";
import { api } from "./client";
import { MOCK_MODE } from "./index";

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (MOCK_MODE) return fetchTeamMembers();
  return api.get<TeamMember[]>("/api/settings/team");
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (MOCK_MODE) return fetchGeneralSettings();
  return api.get<GeneralSettings>("/api/settings/general");
}

export async function getCredentials(): Promise<Credential[]> {
  if (MOCK_MODE) return fetchCredentials();
  return api.get<Credential[]>("/api/settings/credentials");
}

export async function getIntegrations(): Promise<Integration[]> {
  if (MOCK_MODE) return fetchIntegrations();
  return api.get<Integration[]>("/api/settings/integrations");
}

export async function getNotificationRules(): Promise<NotificationRule[]> {
  if (MOCK_MODE) return fetchNotificationRules();
  return api.get<NotificationRule[]>("/api/settings/notifications");
}
