import { useQuery } from "@tanstack/react-query";
import { getClusters, getCluster } from "@/lib/api/clusters";

export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: getClusters,
  });
}

export function useCluster(id: string) {
  return useQuery({
    queryKey: ["clusters", id],
    queryFn: () => getCluster(id),
    enabled: !!id,
  });
}
