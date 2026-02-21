import { App, Build, Deployment } from "../schemas";
import { delay } from "./utils";

const BUILD_LOGS = [
  "[INFO] Cloning repository https://github.com/org/api-service.git",
  "[INFO] Checked out branch: main (commit: a3f8c2d)",
  "[INFO] Detecting build configuration...",
  "[INFO] Found Dockerfile at ./Dockerfile",
  "[INFO] Building Docker image: registry.kube.internal/api-service:a3f8c2d",
  "[INFO] Step 1/12 : FROM node:20-alpine AS builder",
  "[INFO] Step 2/12 : WORKDIR /app",
  "[INFO] Step 3/12 : COPY package*.json ./",
  "[INFO] Step 4/12 : RUN npm ci --only=production",
  "[INFO] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported",
  "[INFO] added 342 packages, and audited 343 packages in 18s",
  "[INFO] Step 5/12 : COPY . .",
  "[INFO] Step 6/12 : RUN npm run build",
  "[INFO] > api-service@2.4.1 build",
  "[INFO] > tsc --noEmit && esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js",
  "[INFO] Step 7/12 : FROM node:20-alpine AS runtime",
  "[INFO] Step 8/12 : WORKDIR /app",
  "[INFO] Step 9/12 : COPY --from=builder /app/dist ./dist",
  "[INFO] Step 10/12 : COPY --from=builder /app/node_modules ./node_modules",
  "[INFO] Step 11/12 : EXPOSE 3000",
  "[INFO] Step 12/12 : CMD [\"node\", \"dist/index.js\"]",
  "[INFO] Successfully built image sha256:7a3b1c4d",
  "[INFO] Pushing image to registry...",
  "[INFO] Pushed: registry.kube.internal/api-service:a3f8c2d",
  "[INFO] Build complete in 2m 34s",
];

const RUNTIME_LOGS = [
  "[INFO]  2024-01-15T09:00:00Z Server starting on port 3000",
  "[INFO]  2024-01-15T09:00:01Z Connected to PostgreSQL database",
  "[INFO]  2024-01-15T09:00:01Z Redis cache initialized",
  "[INFO]  2024-01-15T09:00:02Z Loaded 42 routes",
  "[INFO]  2024-01-15T09:00:02Z Health check endpoint ready at /health",
  "[INFO]  2024-01-15T09:01:15Z GET /api/v1/users 200 45ms",
  "[INFO]  2024-01-15T09:01:16Z GET /api/v1/products 200 23ms",
  "[WARN]  2024-01-15T09:02:33Z Slow query detected: SELECT * FROM orders WHERE created_at > ? (234ms)",
  "[INFO]  2024-01-15T09:03:11Z POST /api/v1/orders 201 112ms",
  "[INFO]  2024-01-15T09:04:20Z GET /api/v1/users 200 31ms",
  "[ERROR] 2024-01-15T09:05:02Z Failed to connect to external payment service: ECONNREFUSED",
  "[WARN]  2024-01-15T09:05:02Z Retrying payment service connection (attempt 1/3)",
  "[INFO]  2024-01-15T09:05:05Z Payment service reconnected successfully",
  "[INFO]  2024-01-15T09:06:44Z GET /api/v1/health 200 2ms",
  "[INFO]  2024-01-15T09:07:18Z Scheduled job: cleanup-expired-sessions completed (12 sessions removed)",
  "[INFO]  2024-01-15T09:08:00Z GET /api/v1/metrics 200 8ms",
  "[INFO]  2024-01-15T09:09:33Z POST /api/v1/auth/login 200 67ms",
  "[WARN]  2024-01-15T09:10:11Z Rate limit approaching for IP 192.168.1.45 (87/100 requests)",
  "[INFO]  2024-01-15T09:11:05Z GET /api/v1/products?page=2 200 28ms",
  "[ERROR] 2024-01-15T09:12:00Z Unhandled promise rejection: TypeError: Cannot read properties of undefined",
  "[INFO]  2024-01-15T09:12:01Z Error boundary caught exception, sending to Sentry",
];

export const MOCK_APPS: App[] = [
  {
    id: "app-1",
    name: "api-service",
    repoUrl: "https://github.com/acme-corp/api-service",
    branch: "main",
    status: "healthy",
    lastDeployedAt: "2024-01-15T08:30:00Z",
    lastBuildAt: "2024-01-15T08:15:00Z",
    url: "https://api.acme.dev",
    imageTag: "a3f8c2d",
    argoSyncStatus: "Synced",
    argoHealthStatus: "Healthy",
    domains: [
      { id: "d-1", domain: "api.acme.dev", sslStatus: "valid" },
      { id: "d-2", domain: "api-staging.acme.dev", sslStatus: "valid" },
    ],
    envVars: [
      { id: "e-1", key: "NODE_ENV", value: "production", isSecret: false },
      { id: "e-2", key: "PORT", value: "3000", isSecret: false },
      { id: "e-3", key: "DATABASE_URL", value: "postgres://user:pass@db:5432/prod", isSecret: true },
      { id: "e-4", key: "REDIS_URL", value: "redis://cache:6379", isSecret: true },
      { id: "e-5", key: "JWT_SECRET", value: "super-secret-jwt-key-32chars", isSecret: true },
      { id: "e-6", key: "STRIPE_SECRET_KEY", value: "sk_live_xxx", isSecret: true },
    ],
  },
  {
    id: "app-2",
    name: "frontend-web",
    repoUrl: "https://github.com/acme-corp/frontend-web",
    branch: "main",
    status: "deploying",
    lastDeployedAt: "2024-01-15T07:45:00Z",
    lastBuildAt: "2024-01-15T07:30:00Z",
    url: "https://app.acme.dev",
    imageTag: "b5d9e1f",
    argoSyncStatus: "Synced",
    argoHealthStatus: "Progressing",
    domains: [
      { id: "d-3", domain: "app.acme.dev", sslStatus: "valid" },
    ],
    envVars: [
      { id: "e-7", key: "VITE_API_URL", value: "https://api.acme.dev", isSecret: false },
      { id: "e-8", key: "VITE_ANALYTICS_ID", value: "G-XXXXXXX", isSecret: false },
    ],
  },
  {
    id: "app-3",
    name: "worker-queue",
    repoUrl: "https://github.com/acme-corp/worker-queue",
    branch: "main",
    status: "building",
    lastDeployedAt: "2024-01-14T22:00:00Z",
    lastBuildAt: "2024-01-15T09:00:00Z",
    url: "https://workers.acme.dev",
    imageTag: "c7a2b4e",
    argoSyncStatus: "OutOfSync",
    argoHealthStatus: "Progressing",
    domains: [],
    envVars: [
      { id: "e-9", key: "QUEUE_CONCURRENCY", value: "10", isSecret: false },
      { id: "e-10", key: "REDIS_URL", value: "redis://cache:6379", isSecret: true },
    ],
  },
  {
    id: "app-4",
    name: "ml-inference",
    repoUrl: "https://github.com/acme-corp/ml-inference",
    branch: "release/v2",
    status: "degraded",
    lastDeployedAt: "2024-01-13T14:00:00Z",
    lastBuildAt: "2024-01-13T13:30:00Z",
    url: "https://ml.acme.dev",
    imageTag: "d1c3f5a",
    argoSyncStatus: "Synced",
    argoHealthStatus: "Degraded",
    domains: [
      { id: "d-4", domain: "ml.acme.dev", sslStatus: "valid" },
    ],
    envVars: [
      { id: "e-11", key: "MODEL_PATH", value: "/models/v2.0", isSecret: false },
      { id: "e-12", key: "GPU_MEMORY_LIMIT", value: "8Gi", isSecret: false },
    ],
  },
  {
    id: "app-5",
    name: "data-pipeline",
    repoUrl: "https://github.com/acme-corp/data-pipeline",
    branch: "feat/etl-v3",
    status: "failed",
    lastDeployedAt: "2024-01-12T10:00:00Z",
    lastBuildAt: "2024-01-15T06:00:00Z",
    url: "https://pipeline.acme.dev",
    imageTag: "e9f2a1b",
    argoSyncStatus: "Unknown",
    argoHealthStatus: "Unknown",
    domains: [],
    envVars: [
      { id: "e-13", key: "WAREHOUSE_URL", value: "bigquery://project/dataset", isSecret: false },
    ],
  },
  {
    id: "app-6",
    name: "notification-svc",
    repoUrl: "https://github.com/acme-corp/notification-svc",
    branch: "main",
    status: "idle",
    lastDeployedAt: "2024-01-10T09:00:00Z",
    lastBuildAt: "2024-01-10T08:30:00Z",
    url: "https://notify.acme.dev",
    imageTag: "f4b8c6d",
    argoSyncStatus: "Synced",
    argoHealthStatus: "Suspended",
    domains: [
      { id: "d-5", domain: "notify.acme.dev", sslStatus: "valid" },
      { id: "d-6", domain: "notify-v2.acme.dev", sslStatus: "pending" },
    ],
    envVars: [
      { id: "e-14", key: "SMTP_HOST", value: "smtp.sendgrid.net", isSecret: false },
      { id: "e-15", key: "SMTP_API_KEY", value: "SG.xxxxxxx", isSecret: true },
    ],
  },
];

export const MOCK_DEPLOYMENTS: Record<string, Deployment[]> = {
  "app-1": [
    { id: "dep-1", appId: "app-1", version: "v42", commitSha: "a3f8c2d", commitMessage: "feat: add rate limiting to auth endpoints", status: "success", triggeredBy: "alice@acme.dev", deployedAt: "2024-01-15T08:30:00Z", duration: 94, imageTag: "a3f8c2d" },
    { id: "dep-2", appId: "app-1", version: "v41", commitSha: "9e2a7f1", commitMessage: "fix: resolve memory leak in connection pool", status: "success", triggeredBy: "bob@acme.dev", deployedAt: "2024-01-14T15:00:00Z", duration: 87, imageTag: "9e2a7f1" },
    { id: "dep-3", appId: "app-1", version: "v40", commitSha: "8c1b3d9", commitMessage: "refactor: migrate to TypeScript strict mode", status: "rolled_back", triggeredBy: "alice@acme.dev", deployedAt: "2024-01-13T11:20:00Z", duration: 102, imageTag: "8c1b3d9" },
    { id: "dep-4", appId: "app-1", version: "v39", commitSha: "7a4e2c8", commitMessage: "chore: update dependencies", status: "success", triggeredBy: "ci-bot", deployedAt: "2024-01-12T09:45:00Z", duration: 78, imageTag: "7a4e2c8" },
    { id: "dep-5", appId: "app-1", version: "v38", commitSha: "6b5f1a3", commitMessage: "feat: add webhooks support", status: "success", triggeredBy: "alice@acme.dev", deployedAt: "2024-01-11T14:30:00Z", duration: 91, imageTag: "6b5f1a3" },
  ],
  "app-2": [
    { id: "dep-6", appId: "app-2", version: "v18", commitSha: "b5d9e1f", commitMessage: "feat: dark mode toggle + new dashboard", status: "in_progress", triggeredBy: "charlie@acme.dev", deployedAt: "2024-01-15T07:45:00Z", duration: 0, imageTag: "b5d9e1f" },
    { id: "dep-7", appId: "app-2", version: "v17", commitSha: "a4c8f2e", commitMessage: "fix: mobile navigation overflow", status: "success", triggeredBy: "charlie@acme.dev", deployedAt: "2024-01-14T16:00:00Z", duration: 65, imageTag: "a4c8f2e" },
  ],
  "app-3": [
    { id: "dep-8", appId: "app-3", version: "v7", commitSha: "c7a2b4e", commitMessage: "perf: optimize job processing pipeline", status: "success", triggeredBy: "ci-bot", deployedAt: "2024-01-14T22:00:00Z", duration: 58, imageTag: "c7a2b4e" },
  ],
};

export const MOCK_BUILDS: Record<string, Build[]> = {
  "app-1": [
    { id: "bld-1", appId: "app-1", commitSha: "a3f8c2d", commitMessage: "feat: add rate limiting", status: "success", startedAt: "2024-01-15T08:15:00Z", duration: 154, logs: BUILD_LOGS },
    { id: "bld-2", appId: "app-1", commitSha: "9e2a7f1", commitMessage: "fix: memory leak", status: "success", startedAt: "2024-01-14T14:40:00Z", duration: 142, logs: BUILD_LOGS.slice(0, 20) },
    { id: "bld-3", appId: "app-1", commitSha: "8c1b3d9", commitMessage: "refactor: TypeScript strict", status: "failed", startedAt: "2024-01-13T11:00:00Z", duration: 67, logs: [...BUILD_LOGS.slice(0, 12), "[ERROR] TypeScript compilation failed: 23 errors found", "[ERROR] src/auth/middleware.ts(45,12): error TS2345: Argument of type 'string | undefined'", "[ERROR] Build failed."] },
    { id: "bld-4", appId: "app-1", commitSha: "7a4e2c8", commitMessage: "chore: update deps", status: "success", startedAt: "2024-01-12T09:30:00Z", duration: 138, logs: BUILD_LOGS },
  ],
  "app-2": [
    { id: "bld-5", appId: "app-2", commitSha: "b5d9e1f", commitMessage: "feat: dark mode", status: "building", startedAt: "2024-01-15T07:30:00Z", duration: 0, logs: BUILD_LOGS.slice(0, 8) },
    { id: "bld-6", appId: "app-2", commitSha: "a4c8f2e", commitMessage: "fix: mobile nav", status: "success", startedAt: "2024-01-14T15:40:00Z", duration: 118, logs: BUILD_LOGS },
  ],
};

export async function fetchApps(): Promise<App[]> {
  await delay(400, 700);
  return MOCK_APPS;
}

export async function fetchApp(id: string): Promise<App> {
  await delay(300, 600);
  const app = MOCK_APPS.find((a) => a.id === id);
  if (!app) throw new Error(`App not found: ${id}`);
  return app;
}

export async function fetchDeployments(appId: string): Promise<Deployment[]> {
  await delay(400, 700);
  return MOCK_DEPLOYMENTS[appId] ?? [];
}

export async function fetchBuilds(appId: string): Promise<Build[]> {
  await delay(400, 700);
  return MOCK_BUILDS[appId] ?? [];
}

export async function fetchBuildLogs(buildId: string): Promise<string[]> {
  await delay(300, 500);
  for (const builds of Object.values(MOCK_BUILDS)) {
    const build = builds.find((b) => b.id === buildId);
    if (build) return build.logs;
  }
  return [];
}

export async function fetchRuntimeLogs(): Promise<string[]> {
  await delay(300, 500);
  return RUNTIME_LOGS;
}
