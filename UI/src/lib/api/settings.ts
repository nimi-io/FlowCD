import {
  fetchCredentials,
  fetchGeneralSettings,
  fetchIntegrations,
  fetchNotificationRules,
  fetchTeamMembers,
} from "../mock/settings";
import { Credential, GeneralSettings, Integration, NotificationRule, TeamMember } from "../schemas";

export async function getTeamMembers(): Promise<TeamMember[]> {
  return fetchTeamMembers();
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  return fetchGeneralSettings();
}

export async function getCredentials(): Promise<Credential[]> {
  return fetchCredentials();
}

export async function getIntegrations(): Promise<Integration[]> {
  return fetchIntegrations();
}

export async function getNotificationRules(): Promise<NotificationRule[]> {
  return fetchNotificationRules();
}
