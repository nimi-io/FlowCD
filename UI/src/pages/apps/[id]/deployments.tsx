import { useParams } from "react-router-dom";
import { useDeployments } from "@/hooks/useApps";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { RotateCcw, GitCommit, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeploymentsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deployments, isLoading, isError, refetch } = useDeployments(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-5">
        <h2 className="section-title text-base">Deployment History</h2>
        <p className="section-subtitle">{deployments?.length ?? 0} deployments</p>
      </div>

      {deployments?.length === 0 ? (
        <EmptyState icon={RotateCcw} title="No deployments yet" description="Deploy your app to see history here." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Version</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Commit</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Triggered By</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Deployed</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {deployments?.map((dep, i) => (
                  <tr
                    key={dep.id}
                    className={cn(
                      "border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors",
                      i === 0 && "bg-primary/[0.03]",
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-foreground">{dep.version}</span>
                      {i === 0 && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md font-mono">
                          CURRENT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <span className="font-mono text-xs text-primary">{dep.commitSha}</span>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{dep.commitMessage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={dep.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">{dep.triggeredBy}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-xs text-foreground">{format(new Date(dep.deployedAt), "MMM d, HH:mm")}</span>
                        <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(dep.deployedAt), { addSuffix: true })}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Clock className="h-3 w-3" />
                        {dep.duration > 0 ? `${dep.duration}s` : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {dep.status !== "in_progress" && i !== 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 rounded-lg">
                          <RotateCcw className="h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {deployments?.map((dep, i) => (
              <div key={dep.id} className={cn("glass-card p-4", i === 0 && "ring-1 ring-primary/20")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">{dep.version}</span>
                    {i === 0 && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono">CURRENT</span>
                    )}
                  </div>
                  <StatusBadge status={dep.status} />
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <GitCommit className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs text-primary">{dep.commitSha}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 truncate">{dep.commitMessage}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{dep.triggeredBy}</span>
                  <span>{formatDistanceToNow(new Date(dep.deployedAt), { addSuffix: true })}</span>
                </div>
                {dep.status !== "in_progress" && i !== 0 && (
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs gap-1.5 rounded-lg h-8">
                    <RotateCcw className="h-3 w-3" />
                    Rollback to this version
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
