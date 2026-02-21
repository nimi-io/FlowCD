import { useParams } from "react-router-dom";
import { usePipeline } from "@/hooks/usePipelines";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Play, Check, X, Clock, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineStatus } from "@/lib/schemas";

function StageIcon({ status }: { status: PipelineStatus }) {
  if (status === "succeeded") return <Check className="h-4 w-4 text-status-healthy" />;
  if (status === "failed") return <X className="h-4 w-4 text-status-failed" />;
  if (status === "running") return <div className="h-3 w-3 rounded-full bg-status-deploying animate-pulse" />;
  return <div className="h-3 w-3 rounded-full bg-muted/40" />;
}

export default function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pipeline, isLoading, isError, refetch } = usePipeline(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!pipeline) return null;

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-mono font-semibold text-foreground">{pipeline.name}</h1>
          <p className="section-subtitle">Linked to {pipeline.appName}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={pipeline.lastRunStatus} />
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20">
            <Play className="h-3.5 w-3.5" />
            Re-trigger
          </Button>
        </div>
      </div>

      {/* DAG Visualization */}
      <div className="glass-card p-4 sm:p-6 mb-6">
        <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-4 font-medium">Pipeline Stages</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {pipeline.stages.map((stage, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                  stage.status === "succeeded"
                    ? "bg-status-healthy/8 border-status-healthy/20"
                    : stage.status === "failed"
                    ? "bg-status-failed/8 border-status-failed/20"
                    : stage.status === "running"
                    ? "bg-status-deploying/8 border-status-deploying/20"
                    : "bg-muted/20 border-border/40",
                )}
              >
                <StageIcon status={stage.status} />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{stage.name}</span>
                {stage.duration > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono">{stage.duration}s</span>
                )}
              </div>
              {i < pipeline.stages.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Runs */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">Recent Runs</h3>
        </div>
        {/* Desktop */}
        <div className="hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Run ID</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Triggered By</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Started</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.runs.map((run) => (
                <tr key={run.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{run.id}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={run.status} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">{run.triggeredBy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {format(new Date(run.startedAt), "MMM d, HH:mm")}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      {run.duration > 0 ? `${run.duration}s` : "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="sm:hidden divide-y divide-border/20">
          {pipeline.runs.map((run) => (
            <div key={run.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-primary">{run.id}</span>
                <StatusBadge status={run.status} />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="font-mono">{run.triggeredBy}</span>
                <span>{format(new Date(run.startedAt), "MMM d, HH:mm")}</span>
                <span className="font-mono">{run.duration > 0 ? `${run.duration}s` : "—"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
