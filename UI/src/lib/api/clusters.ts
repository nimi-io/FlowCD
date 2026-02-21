import { fetchCluster, fetchClusters } from "../mock/clusters";
import { Cluster } from "../schemas";

export async function getClusters(): Promise<Cluster[]> {
  return fetchClusters();
}

export async function getCluster(id: string): Promise<Cluster> {
  return fetchCluster(id);
}
