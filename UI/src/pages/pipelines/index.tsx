import { Link } from "react-router-dom";
import { usePipelines } from "@/hooks/usePipelines";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { GitBranch, Layers } from "lucide-react";

export default function PipelinesPage() {
  const { data: pipelines, isLoading, isError, refetch } = usePipelines();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Tekton Pipelines</h1>
        <p className="section-subtitle">{pipelines?.length ?? 0} pipelines</p>
      </div>

      {pipelines?.length === 0 ? (
        <EmptyState icon={Layers} title="No pipelines" description="Create a Tekton pipeline to automate your deployments." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pipeline</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Linked App</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Run</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Stages</th>
                </tr>
              </thead>
              <tbody>
                {pipelines?.map((pipe) => (
                  <tr key={pipe.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/pipelines/${pipe.id}`} className="font-mono text-sm text-primary hover:underline">
                        {pipe.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/apps/${pipe.appId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <GitBranch className="h-3 w-3" />
                        {pipe.appName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(pipe.lastRunAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={pipe.lastRunStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {pipe.stages.map((stage, i) => (
                          <div
                            key={i}
                            title={stage.name}
                            className={`h-2.5 w-5 rounded-md ${
                              stage.status === "succeeded"
                                ? "bg-status-healthy"
                                : stage.status === "failed"
                                ? "bg-status-failed"
                                : stage.status === "running"
                                ? "bg-status-deploying animate-pulse"
                                : "bg-muted/40"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {pipelines?.map((pipe) => (
              <Link key={pipe.id} to={`/pipelines/${pipe.id}`} className="block">
                <div className="glass-card card-hover p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-primary font-medium">{pipe.name}</span>
                    <StatusBadge status={pipe.lastRunStatus} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <GitBranch className="h-3 w-3" />
                    <span>{pipe.appName}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{formatDistanceToNow(new Date(pipe.lastRunAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {pipe.stages.map((stage, i) => (
                      <div
                        key={i}
                        title={stage.name}
                        className={`h-2 flex-1 rounded-md ${
                          stage.status === "succeeded"
                            ? "bg-status-healthy"
                            : stage.status === "failed"
                            ? "bg-status-failed"
                            : stage.status === "running"
                            ? "bg-status-deploying animate-pulse"
                            : "bg-muted/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
