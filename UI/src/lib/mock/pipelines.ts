import { Pipeline } from "../schemas";
import { delay } from "./utils";

export const MOCK_PIPELINES: Pipeline[] = [
  {
    id: "pipe-1",
    name: "api-service-ci",
    appId: "app-1",
    appName: "api-service",
    lastRunStatus: "succeeded",
    lastRunAt: "2024-01-15T08:20:00Z",
    stages: [
      { name: "Clone", status: "succeeded", duration: 8 },
      { name: "Install", status: "succeeded", duration: 24 },
      { name: "Lint", status: "succeeded", duration: 12 },
      { name: "Test", status: "succeeded", duration: 67 },
      { name: "Build", status: "succeeded", duration: 154 },
      { name: "Push", status: "succeeded", duration: 23 },
      { name: "Deploy", status: "succeeded", duration: 45 },
    ],
    runs: [
      { id: "run-1", status: "succeeded", startedAt: "2024-01-15T08:08:00Z", duration: 333, triggeredBy: "alice@acme.dev" },
      { id: "run-2", status: "succeeded", startedAt: "2024-01-14T14:45:00Z", duration: 287, triggeredBy: "bob@acme.dev" },
      { id: "run-3", status: "failed", startedAt: "2024-01-13T11:05:00Z", duration: 89, triggeredBy: "alice@acme.dev" },
      { id: "run-4", status: "succeeded", startedAt: "2024-01-12T09:30:00Z", duration: 312, triggeredBy: "ci-bot" },
      { id: "run-5", status: "succeeded", startedAt: "2024-01-11T14:25:00Z", duration: 298, triggeredBy: "alice@acme.dev" },
    ],
  },
  {
    id: "pipe-2",
    name: "frontend-web-cd",
    appId: "app-2",
    appName: "frontend-web",
    lastRunStatus: "running",
    lastRunAt: "2024-01-15T07:30:00Z",
    stages: [
      { name: "Clone", status: "succeeded", duration: 5 },
      { name: "Install", status: "succeeded", duration: 18 },
      { name: "Build", status: "running", duration: 0 },
      { name: "Test", status: "pending", duration: 0 },
      { name: "Push", status: "pending", duration: 0 },
      { name: "Deploy", status: "pending", duration: 0 },
    ],
    runs: [
      { id: "run-6", status: "running", startedAt: "2024-01-15T07:30:00Z", duration: 0, triggeredBy: "charlie@acme.dev" },
      { id: "run-7", status: "succeeded", startedAt: "2024-01-14T15:40:00Z", duration: 245, triggeredBy: "charlie@acme.dev" },
    ],
  },
  {
    id: "pipe-3",
    name: "ml-inference-deploy",
    appId: "app-4",
    appName: "ml-inference",
    lastRunStatus: "failed",
    lastRunAt: "2024-01-13T13:35:00Z",
    stages: [
      { name: "Clone", status: "succeeded", duration: 6 },
      { name: "Validate", status: "succeeded", duration: 14 },
      { name: "Build", status: "failed", duration: 34 },
      { name: "Test", status: "pending", duration: 0 },
      { name: "Deploy", status: "pending", duration: 0 },
    ],
    runs: [
      { id: "run-8", status: "failed", startedAt: "2024-01-13T13:35:00Z", duration: 54, triggeredBy: "ci-bot" },
      { id: "run-9", status: "succeeded", startedAt: "2024-01-10T10:00:00Z", duration: 422, triggeredBy: "diana@acme.dev" },
    ],
  },
  {
    id: "pipe-4",
    name: "data-pipeline-etl",
    appId: "app-5",
    appName: "data-pipeline",
    lastRunStatus: "pending",
    lastRunAt: "2024-01-15T06:00:00Z",
    stages: [
      { name: "Validate", status: "pending", duration: 0 },
      { name: "Extract", status: "pending", duration: 0 },
      { name: "Transform", status: "pending", duration: 0 },
      { name: "Load", status: "pending", duration: 0 },
    ],
    runs: [
      { id: "run-10", status: "pending", startedAt: "2024-01-15T06:00:00Z", duration: 0, triggeredBy: "scheduler" },
    ],
  },
];

export async function fetchPipelines(): Promise<Pipeline[]> {
  await delay(400, 700);
  return MOCK_PIPELINES;
}

export async function fetchPipeline(id: string): Promise<Pipeline> {
  await delay(300, 600);
  const pipeline = MOCK_PIPELINES.find((p) => p.id === id);
  if (!pipeline) throw new Error(`Pipeline not found: ${id}`);
  return pipeline;
}
