import { fetchPipeline, fetchPipelines } from "../mock/pipelines";
import { Pipeline } from "../schemas";
import { api } from "./client";
import { MOCK_MODE } from "./index";

export async function getPipelines(): Promise<Pipeline[]> {
  if (MOCK_MODE) return fetchPipelines();
  return api.get<Pipeline[]>("/api/pipelines");
}

export async function getPipeline(id: string): Promise<Pipeline> {
  if (MOCK_MODE) return fetchPipeline(id);
  return api.get<Pipeline>(`/api/pipelines/${id}`);
}
