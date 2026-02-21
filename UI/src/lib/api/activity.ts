import { fetchActivityEvents } from "../mock/activity";
import { ActivityEvent } from "../schemas";

export async function getActivityEvents(page = 1): Promise<{ events: ActivityEvent[]; hasMore: boolean }> {
  return fetchActivityEvents(page);
}
