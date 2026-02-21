import { useQuery } from "@tanstack/react-query";
import { getPipelines, getPipeline } from "@/lib/api/pipelines";

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: getPipelines,
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ["pipelines", id],
    queryFn: () => getPipeline(id),
    enabled: !!id,
  });
}
