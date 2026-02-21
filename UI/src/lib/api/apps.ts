import {
  fetchApps,
  fetchApp,
  fetchDeployments,
  fetchBuilds,
  fetchBuildLogs,
  fetchRuntimeLogs,
} from "../mock/apps";
import { App, Build, Deployment } from "../schemas";

export async function getApps(): Promise<App[]> {
  return fetchApps();
}

export async function getApp(id: string): Promise<App> {
  return fetchApp(id);
}

export async function getDeployments(appId: string): Promise<Deployment[]> {
  return fetchDeployments(appId);
}

export async function getBuilds(appId: string): Promise<Build[]> {
  return fetchBuilds(appId);
}

export async function getBuildLogs(buildId: string): Promise<string[]> {
  return fetchBuildLogs(buildId);
}

export async function getRuntimeLogs(_appId: string): Promise<string[]> {
  return fetchRuntimeLogs();
}
