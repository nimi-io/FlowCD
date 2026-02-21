import { useParams } from "react-router-dom";
import { useCluster } from "@/hooks/useClusters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";

function UsageBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 90 ? "bg-status-failed" : value >= 75 ? "bg-status-degraded" : value >= 60 ? "bg-status-building" : "bg-status-healthy";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-7 flex-shrink-0 font-mono">{label}</span>
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-9 text-right">{value}%</span>
    </div>
  );
}

export default function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cluster, isLoading, isError, refetch } = useCluster(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!cluster) return null;

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-mono font-semibold text-foreground">{cluster.name}</h1>
          <p className="section-subtitle">
            {cluster.provider} · {cluster.region} · k8s {cluster.k8sVersion}
          </p>
        </div>
        <StatusBadge status={cluster.health} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Nodes", value: cluster.nodeCount },
          { label: "Namespaces", value: cluster.namespaces.length },
          { label: "Total Pods", value: cluster.namespaces.reduce((s, n) => s + n.podCount, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="font-mono text-2xl font-bold text-foreground">{value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Nodes */}
      <div className="glass-card p-4 sm:p-5 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Nodes ({cluster.nodes.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cluster.nodes.map((node) => (
            <div key={node.name} className="border border-border/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-xs text-foreground">{node.name}</span>
                <StatusBadge status={node.status} />
              </div>
              <div className="space-y-1.5">
                <UsageBar value={node.cpu} label="CPU" />
                <UsageBar value={node.memory} label="MEM" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Namespaces */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">Namespaces</h3>
        </div>
        {/* Desktop */}
        <div className="hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Namespace</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pods</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">CPU Req</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Mem Req</th>
              </tr>
            </thead>
            <tbody>
              {cluster.namespaces.map((ns) => (
                <tr key={ns.name} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{ns.name}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={ns.status === "Active" ? "healthy" : "deploying"} showDot={false} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{ns.podCount}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{ns.cpuRequest}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{ns.memRequest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="sm:hidden divide-y divide-border/20">
          {cluster.namespaces.map((ns) => (
            <div key={ns.name} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-foreground">{ns.name}</span>
                <StatusBadge status={ns.status === "Active" ? "healthy" : "deploying"} showDot={false} />
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
                <span>{ns.podCount} pods</span>
                <span>CPU: {ns.cpuRequest}</span>
                <span>Mem: {ns.memRequest}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
