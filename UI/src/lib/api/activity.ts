import { fetchActivityEvents } from "../mock/activity";
import { ActivityEvent } from "../schemas";
import { api } from "./client";
import { MOCK_MODE } from "./index";

interface ActivityPage {
  events: ActivityEvent[];
  hasMore: boolean;
}

export async function getActivityEvents(page = 1): Promise<ActivityPage> {
  if (MOCK_MODE) return fetchActivityEvents(page);
  return api.get<ActivityPage>(`/api/activity?page=${page}`);
}
