import { useParams } from "react-router-dom";
import { useApp } from "@/hooks/useApps";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDistanceToNow, format } from "date-fns";
import {
  GitBranch,
  Globe,
  Tag,
  Clock,
  GitCommit,
  Activity,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("glass-card p-4", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="h-7 w-7 rounded-lg bg-muted/40 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="font-mono text-sm font-semibold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function AppOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading, isError, refetch } = useApp(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!app) return null;

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Status"
          value={<StatusBadge status={app.status} />}
          icon={Activity}
        />
        <StatCard
          label="Last Deployed"
          value={formatDistanceToNow(new Date(app.lastDeployedAt), { addSuffix: true })}
          sub={format(new Date(app.lastDeployedAt), "MMM d, HH:mm")}
          icon={Clock}
        />
        <StatCard
          label="Image Tag"
          value={app.imageTag}
          sub="docker image"
          icon={Tag}
        />
        <StatCard
          label="Branch"
          value={app.branch}
          sub={app.repoUrl.split("/").slice(-1)[0]}
          icon={GitBranch}
        />
      </div>

      {/* ArgoCD Status + URL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-4 sm:p-5">
          <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-4 font-medium">ArgoCD Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Status
              </span>
              <StatusBadge status={app.argoSyncStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Health Status
              </span>
              <StatusBadge status={app.argoHealthStatus} />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-4 font-medium">Live URL</h3>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-primary hover:underline truncate flex items-center gap-1"
            >
              {app.url}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {app.domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{d.domain}</span>
                <StatusBadge status={d.sslStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Repository */}
      <div className="glass-card p-4 sm:p-5 mb-6">
        <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Repository</h3>
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-muted-foreground" />
          <a
            href={app.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-primary hover:underline truncate"
          >
            {app.repoUrl}
          </a>
        </div>
        <div className="mt-2 text-xs text-muted-foreground font-mono">
          Branch: <span className="text-foreground">{app.branch}</span>
          {" · "}
          Last build: {formatDistanceToNow(new Date(app.lastBuildAt), { addSuffix: true })}
        </div>
      </div>

      {/* Recent env vars preview */}
      <div className="glass-card p-4 sm:p-5">
        <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">
          Environment Variables ({app.envVars.length})
        </h3>
        <div className="space-y-1.5">
          {app.envVars.slice(0, 4).map((env) => (
            <div key={env.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="font-mono text-xs text-foreground">{env.key}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {env.isSecret ? "••••••••" : env.value}
              </span>
            </div>
          ))}
          {app.envVars.length > 4 && (
            <p className="text-xs text-muted-foreground pt-1">
              +{app.envVars.length - 4} more variables
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
