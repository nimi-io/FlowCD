import { Link } from "react-router-dom";
import { useClusters } from "@/hooks/useClusters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDER_COLORS: Record<string, string> = {
  EKS: "text-status-building",
  GKE: "text-status-deploying",
  AKS: "text-primary",
  "DigitalOcean": "text-status-deploying",
  "Bare Metal": "text-muted-foreground",
};

export default function ClustersPage() {
  const { data: clusters, isLoading, isError, refetch } = useClusters();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Kubernetes Clusters</h1>
        <p className="section-subtitle">{clusters?.length ?? 0} clusters connected</p>
      </div>

      {clusters?.length === 0 ? (
        <EmptyState icon={Server} title="No clusters" description="Connect a Kubernetes cluster to get started." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {clusters?.map((cluster) => (
            <Link key={cluster.id} to={`/clusters/${cluster.id}`} className="block group">
              <div className="glass-card card-hover p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-mono font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cluster.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn("text-xs font-mono font-medium", PROVIDER_COLORS[cluster.provider])}>
                        {cluster.provider}
                      </span>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-xs text-muted-foreground">{cluster.region}</span>
                    </div>
                  </div>
                  <StatusBadge status={cluster.health} />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-muted/20 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="font-mono text-lg font-bold text-foreground">{cluster.nodeCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Nodes</div>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="font-mono text-lg font-bold text-foreground">{cluster.namespaces.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">NS</div>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="font-mono text-sm font-bold text-foreground">{cluster.k8sVersion}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">K8s</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
