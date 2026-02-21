import { useParams } from "react-router-dom";
import { useBuilds } from "@/hooks/useApps";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Hammer, GitCommit, Clock, FileText } from "lucide-react";

export default function BuildsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: builds, isLoading, isError, refetch } = useBuilds(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-5">
        <h2 className="section-title text-base">Build History</h2>
        <p className="section-subtitle">{builds?.length ?? 0} builds</p>
      </div>

      {builds?.length === 0 ? (
        <EmptyState icon={Hammer} title="No builds yet" description="Builds will appear here after your first push." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Build ID</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Commit</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Started</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {builds?.map((build) => (
                  <tr key={build.id} className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs text-primary">{build.id}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <span className="font-mono text-xs text-foreground">{build.commitSha}</span>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{build.commitMessage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={build.status} /></td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-xs text-foreground">{format(new Date(build.startedAt), "MMM d, HH:mm")}</span>
                        <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(build.startedAt), { addSuffix: true })}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Clock className="h-3 w-3" />
                        {build.duration > 0 ? `${build.duration}s` : "Running..."}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 rounded-lg">
                        <FileText className="h-3 w-3" />
                        Logs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {builds?.map((build) => (
              <div key={build.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-primary">{build.id}</span>
                  <StatusBadge status={build.status} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <GitCommit className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground">{build.commitSha}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 truncate">{build.commitMessage}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(build.startedAt), "MMM d, HH:mm")}</span>
                  <span className="font-mono">{build.duration > 0 ? `${build.duration}s` : "Running..."}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
