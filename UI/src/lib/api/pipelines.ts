import { fetchPipeline, fetchPipelines } from "../mock/pipelines";
import { Pipeline } from "../schemas";

export async function getPipelines(): Promise<Pipeline[]> {
  return fetchPipelines();
}

export async function getPipeline(id: string): Promise<Pipeline> {
  return fetchPipeline(id);
}
