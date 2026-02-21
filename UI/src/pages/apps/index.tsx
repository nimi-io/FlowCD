import { useState } from "react";
import { Link } from "react-router-dom";
import { useApps } from "@/hooks/useApps";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { App, AppStatus } from "@/lib/schemas";
import {
  Search,
  Plus,
  GitBranch,
  Globe,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: AppStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Healthy", value: "healthy" },
  { label: "Building", value: "building" },
  { label: "Deploying", value: "deploying" },
  { label: "Degraded", value: "degraded" },
  { label: "Failed", value: "failed" },
  { label: "Idle", value: "idle" },
];

function AppCard({ app }: { app: App }) {
  return (
    <Link to={`/apps/${app.id}`} className="block group">
      <div className="glass-card card-hover p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-mono font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {app.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3 flex-shrink-0" />
              <span className="font-mono truncate">{app.branch}</span>
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="h-3 w-3 flex-shrink-0" />
            <span className="font-mono truncate">{app.url}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>
              Deployed {formatDistanceToNow(new Date(app.lastDeployedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={app.argoSyncStatus} showDot={false} />
            <StatusBadge status={app.argoHealthStatus} showDot={false} />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">{app.imageTag}</span>
        </div>
      </div>
    </Link>
  );
}

export default function AppsPage() {
  const { data: apps, isLoading, isError, refetch } = useApps();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");

  const filtered = apps?.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.repoUrl.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Applications</h1>
          <p className="section-subtitle">
            {apps ? `${apps.length} apps across all clusters` : "Loading..."}
          </p>
        </div>
        <Button asChild size="sm" className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
          <Link to="/apps/new">
            <Plus className="h-4 w-4" />
            New App
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-9 bg-card/60 border-border/60 text-sm rounded-xl h-10 sm:max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                statusFilter === f.value
                  ? "bg-primary/12 text-primary border-primary/25 shadow-sm"
                  : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground hover:bg-muted/30",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {isError && (
        <ErrorState message="Failed to load applications." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && filtered?.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title={search || statusFilter !== "all" ? "No apps match your filters" : "No applications yet"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Deploy your first application to get started."
          }
          action={
            !search && statusFilter === "all" ? (
              <Button asChild size="sm" className="rounded-lg">
                <Link to="/apps/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New App
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && filtered && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
