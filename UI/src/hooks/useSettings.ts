import { useQuery } from "@tanstack/react-query";
import { getTeamMembers, getGeneralSettings, getCredentials, getIntegrations, getNotificationRules } from "@/lib/api/settings";

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: getTeamMembers,
  });
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["settings", "general"],
    queryFn: getGeneralSettings,
  });
}

export function useCredentials() {
  return useQuery({
    queryKey: ["credentials"],
    queryFn: getCredentials,
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: getIntegrations,
  });
}

export function useNotificationRules() {
  return useQuery({
    queryKey: ["notification-rules"],
    queryFn: getNotificationRules,
  });
}
