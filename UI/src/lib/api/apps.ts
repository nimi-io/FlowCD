import {
  fetchApps,
  fetchApp,
  fetchDeployments,
  fetchBuilds,
  fetchBuildLogs,
  fetchRuntimeLogs,
} from "../mock/apps";
import { App, Build, Deployment } from "../schemas";
import { api } from "./client";
import { MOCK_MODE } from "./index";

// ─── Read operations ──────────────────────────────────────────────────────────

export async function getApps(): Promise<App[]> {
  if (MOCK_MODE) return fetchApps();
  return api.get<App[]>("/api/apps");
}

export async function getApp(id: string): Promise<App> {
  if (MOCK_MODE) return fetchApp(id);
  return api.get<App>(`/api/apps/${id}`);
}

export async function getDeployments(appId: string): Promise<Deployment[]> {
  if (MOCK_MODE) return fetchDeployments(appId);
  return api.get<Deployment[]>(`/api/apps/${appId}/deployments`);
}

export async function getBuilds(appId: string): Promise<Build[]> {
  if (MOCK_MODE) return fetchBuilds(appId);
  return api.get<Build[]>(`/api/apps/${appId}/builds`);
}

export async function getBuildLogs(buildId: string): Promise<string[]> {
  if (MOCK_MODE) return fetchBuildLogs(buildId);
  return api.get<string[]>(`/api/builds/${buildId}/logs`);
}

export async function getRuntimeLogs(appId: string): Promise<string[]> {
  if (MOCK_MODE) return fetchRuntimeLogs();
  return api.get<string[]>(`/api/apps/${appId}/logs`);
}

// ─── Write operations ─────────────────────────────────────────────────────────

export interface CreateAppInput {
  name: string;
  repoUrl: string;
  branch?: string;
  domains?: string[];
}

export async function createApp(input: CreateAppInput): Promise<App> {
  if (MOCK_MODE) {
    throw new Error("createApp not available in mock mode");
  }
  return api.post<App>("/api/apps", input);
}

export async function deleteApp(id: string): Promise<void> {
  if (MOCK_MODE) {
    throw new Error("deleteApp not available in mock mode");
  }
  return api.delete(`/api/apps/${id}`);
}

export async function triggerRedeploy(id: string): Promise<void> {
  if (MOCK_MODE) {
    // In mock mode just simulate a short delay.
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
  await api.post(`/api/apps/${id}/redeploy`, {});
}
