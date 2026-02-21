import { ActivityEvent } from "../schemas";
import { delay } from "./utils";

const BASE_EVENTS: ActivityEvent[] = [
  { id: "evt-1", type: "deploy", appId: "app-1", appName: "api-service", message: "Deployed v42 (a3f8c2d) to production", actor: "alice@acme.dev", timestamp: "2024-01-15T08:30:00Z", metadata: { version: "v42", env: "production" } },
  { id: "evt-2", type: "build", appId: "app-1", appName: "api-service", message: "Build bld-1 completed successfully in 2m 34s", actor: "ci-bot", timestamp: "2024-01-15T08:15:00Z", metadata: { duration: "154s" } },
  { id: "evt-3", type: "deploy", appId: "app-2", appName: "frontend-web", message: "Deploy v18 started for frontend-web", actor: "charlie@acme.dev", timestamp: "2024-01-15T07:45:00Z" },
  { id: "evt-4", type: "build", appId: "app-2", appName: "frontend-web", message: "Build started for commit b5d9e1f (feat: dark mode)", actor: "ci-bot", timestamp: "2024-01-15T07:30:00Z" },
  { id: "evt-5", type: "config_change", appId: "app-3", appName: "worker-queue", message: "Updated environment variable QUEUE_CONCURRENCY from 5 to 10", actor: "bob@acme.dev", timestamp: "2024-01-15T07:00:00Z" },
  { id: "evt-6", type: "deploy", appId: "app-1", appName: "api-service", message: "Deployed v41 (9e2a7f1) to production", actor: "bob@acme.dev", timestamp: "2024-01-14T15:00:00Z" },
  { id: "evt-7", type: "rollback", appId: "app-1", appName: "api-service", message: "Rolled back from v40 to v39 due to error rate spike", actor: "alice@acme.dev", timestamp: "2024-01-13T12:00:00Z", metadata: { from: "v40", to: "v39" } },
  { id: "evt-8", type: "cluster_event", message: "Node node-p7q8r9 CPU usage exceeded 85% threshold", actor: "system", timestamp: "2024-01-13T11:30:00Z", metadata: { cluster: "prod-us-east-1", node: "node-p7q8r9" } },
  { id: "evt-9", type: "deploy", appId: "app-4", appName: "ml-inference", message: "Deploy failed for ml-inference: OOMKilled during startup", actor: "ci-bot", timestamp: "2024-01-13T14:10:00Z" },
  { id: "evt-10", type: "domain_change", appId: "app-6", appName: "notification-svc", message: "Added domain notify-v2.acme.dev, SSL provisioning started", actor: "alice@acme.dev", timestamp: "2024-01-12T10:30:00Z" },
  { id: "evt-11", type: "scale", appId: "app-1", appName: "api-service", message: "Scaled api-service from 3 to 5 replicas (HPA trigger: CPU > 70%)", actor: "system", timestamp: "2024-01-12T09:00:00Z" },
  { id: "evt-12", type: "build", appId: "app-5", appName: "data-pipeline", message: "Build failed: Dockerfile not found at ./Dockerfile.etl", actor: "ci-bot", timestamp: "2024-01-11T14:00:00Z" },
  { id: "evt-13", type: "deploy", appId: "app-1", appName: "api-service", message: "Deployed v39 (7a4e2c8) to production", actor: "ci-bot", timestamp: "2024-01-12T09:45:00Z" },
  { id: "evt-14", type: "config_change", appId: "app-4", appName: "ml-inference", message: "Updated GPU_MEMORY_LIMIT from 4Gi to 8Gi", actor: "diana@acme.dev", timestamp: "2024-01-11T13:00:00Z" },
  { id: "evt-15", type: "cluster_event", message: "Cluster prod-us-east-1 certificate auto-renewed for *.acme.dev", actor: "cert-manager", timestamp: "2024-01-10T03:00:00Z" },
];

export async function fetchActivityEvents(page = 1, pageSize = 10): Promise<{ events: ActivityEvent[]; hasMore: boolean }> {
  await delay(400, 700);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const events = BASE_EVENTS.slice(start, end);
  return { events, hasMore: end < BASE_EVENTS.length };
}
