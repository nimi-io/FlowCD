import { Cluster } from "../schemas";
import { delay } from "./utils";

export const MOCK_CLUSTERS: Cluster[] = [
  {
    id: "cluster-1",
    name: "prod-us-east-1",
    provider: "EKS",
    nodeCount: 12,
    health: "healthy",
    k8sVersion: "1.28.5",
    region: "us-east-1",
    nodes: [
      { name: "node-a1b2c3", cpu: 34, memory: 58, status: "Ready" },
      { name: "node-d4e5f6", cpu: 67, memory: 72, status: "Ready" },
      { name: "node-g7h8i9", cpu: 45, memory: 61, status: "Ready" },
      { name: "node-j1k2l3", cpu: 22, memory: 43, status: "Ready" },
      { name: "node-m4n5o6", cpu: 89, memory: 91, status: "Ready" },
      { name: "node-p7q8r9", cpu: 55, memory: 67, status: "Ready" },
    ],
    namespaces: [
      { name: "default", status: "Active", podCount: 8, cpuRequest: "1200m", memRequest: "2.4Gi" },
      { name: "production", status: "Active", podCount: 34, cpuRequest: "8400m", memRequest: "16.8Gi" },
      { name: "monitoring", status: "Active", podCount: 12, cpuRequest: "3200m", memRequest: "6.4Gi" },
      { name: "ingress-nginx", status: "Active", podCount: 4, cpuRequest: "800m", memRequest: "1.6Gi" },
      { name: "cert-manager", status: "Active", podCount: 3, cpuRequest: "300m", memRequest: "600Mi" },
    ],
  },
  {
    id: "cluster-2",
    name: "staging-eu-west-1",
    provider: "GKE",
    nodeCount: 6,
    health: "healthy",
    k8sVersion: "1.28.3",
    region: "europe-west1",
    nodes: [
      { name: "gke-node-alpha", cpu: 41, memory: 55, status: "Ready" },
      { name: "gke-node-beta", cpu: 28, memory: 39, status: "Ready" },
      { name: "gke-node-gamma", cpu: 76, memory: 82, status: "Ready" },
    ],
    namespaces: [
      { name: "default", status: "Active", podCount: 4, cpuRequest: "400m", memRequest: "800Mi" },
      { name: "staging", status: "Active", podCount: 18, cpuRequest: "3600m", memRequest: "7.2Gi" },
    ],
  },
  {
    id: "cluster-3",
    name: "dev-local",
    provider: "Bare Metal",
    nodeCount: 3,
    health: "degraded",
    k8sVersion: "1.27.9",
    region: "on-premise",
    nodes: [
      { name: "master-01", cpu: 12, memory: 34, status: "Ready" },
      { name: "worker-01", cpu: 88, memory: 95, status: "Ready" },
      { name: "worker-02", cpu: 5, memory: 20, status: "NotReady" },
    ],
    namespaces: [
      { name: "default", status: "Active", podCount: 2, cpuRequest: "200m", memRequest: "400Mi" },
      { name: "dev", status: "Active", podCount: 6, cpuRequest: "1200m", memRequest: "2.4Gi" },
    ],
  },
];

export async function fetchClusters(): Promise<Cluster[]> {
  await delay(400, 700);
  return MOCK_CLUSTERS;
}

export async function fetchCluster(id: string): Promise<Cluster> {
  await delay(300, 600);
  const cluster = MOCK_CLUSTERS.find((c) => c.id === id);
  if (!cluster) throw new Error(`Cluster not found: ${id}`);
  return cluster;
}
