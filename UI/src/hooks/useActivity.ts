import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivityEvents } from "@/lib/api/activity";
import { ActivityEvent } from "@/lib/schemas";

export function useActivity() {
  const [page, setPage] = useState(1);
  const [allEvents, setAllEvents] = useState<ActivityEvent[]>([]);

  const query = useQuery({
    queryKey: ["activity", page],
    queryFn: () => getActivityEvents(page),
  });

  const loadMore = () => {
    if (query.data?.hasMore) {
      setAllEvents((prev) => [...prev, ...(query.data?.events ?? [])]);
      setPage((p) => p + 1);
    }
  };

  return {
    ...query,
    events: page === 1 ? query.data?.events ?? [] : allEvents,
    hasMore: query.data?.hasMore ?? false,
    loadMore,
  };
}
