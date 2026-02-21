import { useQuery } from "@tanstack/react-query";
import { getApps, getApp, getDeployments, getBuilds, getRuntimeLogs } from "@/lib/api/apps";

export function useApps() {
  return useQuery({
    queryKey: ["apps"],
    queryFn: getApps,
  });
}

export function useApp(id: string) {
  return useQuery({
    queryKey: ["apps", id],
    queryFn: () => getApp(id),
    enabled: !!id,
  });
}

export function useDeployments(appId: string) {
  return useQuery({
    queryKey: ["deployments", appId],
    queryFn: () => getDeployments(appId),
    enabled: !!appId,
  });
}

export function useBuilds(appId: string) {
  return useQuery({
    queryKey: ["builds", appId],
    queryFn: () => getBuilds(appId),
    enabled: !!appId,
  });
}

export function useRuntimeLogs(appId: string) {
  return useQuery({
    queryKey: ["runtime-logs", appId],
    queryFn: () => getRuntimeLogs(appId),
    enabled: !!appId,
  });
}
