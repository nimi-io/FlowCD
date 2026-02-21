import { cn } from "@/lib/utils";
import { AppStatus, BuildStatus, ClusterHealth, DeploymentStatus, PipelineStatus } from "@/lib/schemas";

type AnyStatus = AppStatus | BuildStatus | DeploymentStatus | PipelineStatus | ClusterHealth | "succeeded" | "running" | "valid" | "pending" | "failed" | "Synced" | "OutOfSync" | "Unknown" | "Healthy" | "Degraded" | "Progressing" | "Suspended" | "Missing" | "Ready" | "NotReady" | string;

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  // App statuses
  healthy: { label: "Healthy", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  building: { label: "Building", dot: "bg-status-building animate-pulse", badge: "text-status-building bg-status-building/10 border-status-building/20" },
  deploying: { label: "Deploying", dot: "bg-status-deploying animate-pulse", badge: "text-status-deploying bg-status-deploying/10 border-status-deploying/20" },
  degraded: { label: "Degraded", dot: "bg-status-degraded", badge: "text-status-degraded bg-status-degraded/10 border-status-degraded/20" },
  failed: { label: "Failed", dot: "bg-status-failed", badge: "text-status-failed bg-status-failed/10 border-status-failed/20" },
  idle: { label: "Idle", dot: "bg-status-idle", badge: "text-status-idle bg-status-idle/10 border-status-idle/20" },
  // Deployment/Build statuses
  success: { label: "Success", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  succeeded: { label: "Succeeded", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  in_progress: { label: "In Progress", dot: "bg-status-deploying animate-pulse", badge: "text-status-deploying bg-status-deploying/10 border-status-deploying/20" },
  running: { label: "Running", dot: "bg-status-deploying animate-pulse", badge: "text-status-deploying bg-status-deploying/10 border-status-deploying/20" },
  rolled_back: { label: "Rolled Back", dot: "bg-status-degraded", badge: "text-status-degraded bg-status-degraded/10 border-status-degraded/20" },
  pending: { label: "Pending", dot: "bg-status-idle", badge: "text-status-idle bg-status-idle/10 border-status-idle/20" },
  // Cluster
  unreachable: { label: "Unreachable", dot: "bg-status-failed", badge: "text-status-failed bg-status-failed/10 border-status-failed/20" },
  // SSL
  valid: { label: "Valid", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  // ArgoCD
  Synced: { label: "Synced", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  OutOfSync: { label: "Out of Sync", dot: "bg-status-degraded", badge: "text-status-degraded bg-status-degraded/10 border-status-degraded/20" },
  Unknown: { label: "Unknown", dot: "bg-status-idle", badge: "text-status-idle bg-status-idle/10 border-status-idle/20" },
  Healthy: { label: "Healthy", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  Degraded: { label: "Degraded", dot: "bg-status-degraded", badge: "text-status-degraded bg-status-degraded/10 border-status-degraded/20" },
  Progressing: { label: "Progressing", dot: "bg-status-deploying animate-pulse", badge: "text-status-deploying bg-status-deploying/10 border-status-deploying/20" },
  Suspended: { label: "Suspended", dot: "bg-status-idle", badge: "text-status-idle bg-status-idle/10 border-status-idle/20" },
  Missing: { label: "Missing", dot: "bg-status-failed", badge: "text-status-failed bg-status-failed/10 border-status-failed/20" },
  // Node
  Ready: { label: "Ready", dot: "bg-status-healthy", badge: "text-status-healthy bg-status-healthy/10 border-status-healthy/20" },
  NotReady: { label: "Not Ready", dot: "bg-status-failed", badge: "text-status-failed bg-status-failed/10 border-status-failed/20" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    dot: "bg-status-idle",
    badge: "text-status-idle bg-status-idle/10 border-status-idle/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-mono font-medium",
        config.badge,
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dot)} />}
      {config.label}
    </span>
  );
}
