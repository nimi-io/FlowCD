import { fetchCluster, fetchClusters } from "../mock/clusters";
import { Cluster } from "../schemas";
import { api } from "./client";
import { MOCK_MODE } from "./index";

export async function getClusters(): Promise<Cluster[]> {
  if (MOCK_MODE) return fetchClusters();
  return api.get<Cluster[]>("/api/clusters");
}

export async function getCluster(id: string): Promise<Cluster> {
  if (MOCK_MODE) return fetchCluster(id);
  return api.get<Cluster>(`/api/clusters/${id}`);
}
