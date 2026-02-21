import { useActivity } from "@/hooks/useActivity";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ActivityEventType } from "@/lib/schemas";
import { formatDistanceToNow } from "date-fns";
import { Activity, Rocket, RotateCcw, Hammer, Settings, Globe, Scale, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

const EVENT_ICONS: Record<ActivityEventType, React.ComponentType<{ className?: string }>> = {
  deploy: Rocket,
  rollback: RotateCcw,
  build: Hammer,
  config_change: Settings,
  domain_change: Globe,
  scale: Scale,
  cluster_event: Server,
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  deploy: "text-status-deploying bg-status-deploying/10",
  rollback: "text-status-degraded bg-status-degraded/10",
  build: "text-status-building bg-status-building/10",
  config_change: "text-muted-foreground bg-muted/40",
  domain_change: "text-primary bg-primary/10",
  scale: "text-status-healthy bg-status-healthy/10",
  cluster_event: "text-muted-foreground bg-muted/40",
};

const TYPE_FILTERS: { label: string; value: ActivityEventType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Deploys", value: "deploy" },
  { label: "Rollbacks", value: "rollback" },
  { label: "Builds", value: "build" },
  { label: "Config", value: "config_change" },
  { label: "Cluster", value: "cluster_event" },
];

export default function ActivityPage() {
  const { events, isLoading, isError, refetch, hasMore, loadMore } = useActivity();
  const [typeFilter, setTypeFilter] = useState<ActivityEventType | "all">("all");

  const filtered = typeFilter === "all" ? events : events.filter((e) => e.type === typeFilter);

  if (isLoading && events.length === 0) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Activity Feed</h1>
        <p className="section-subtitle">Global events across all apps and clusters</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              typeFilter === f.value
                ? "bg-primary/12 text-primary border-primary/25 shadow-sm"
                : "text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted/30",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} title="No events" description="Activity events will appear here as they occur." />
      ) : (
        <div className="space-y-0 relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border/30 hidden sm:block" />

          {filtered.map((event) => {
            const Icon = EVENT_ICONS[event.type] ?? Activity;
            const colorClass = EVENT_COLORS[event.type] ?? "text-muted-foreground bg-muted/40";

            return (
              <div key={event.id} className="relative flex gap-3 sm:gap-4 pb-3 animate-fade-in">
                <div className={cn("relative z-10 flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center mt-0.5", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 glass-card px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{event.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {event.appName && (
                          <Link to={`/apps/${event.appId}`} className="text-xs font-mono text-primary hover:underline">
                            {event.appName}
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">by {event.actor}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={loadMore} className="rounded-lg">
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
