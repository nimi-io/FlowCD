import { Outlet, useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApps";
import { AppSubNav } from "@/components/layout/AppSubNav";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Rocket, RotateCcw, FileText } from "lucide-react";

export default function AppLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: app, isLoading, isError, refetch } = useApp(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} message="Failed to load app details." />;

  return (
    <div className="flex flex-col h-full">
      {/* App Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-mono font-semibold text-foreground truncate">{app?.name}</h1>
            {app && <StatusBadge status={app.status} />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs rounded-lg hidden sm:flex"
              onClick={() => navigate(`/apps/${id}/logs`)}
            >
              <FileText className="h-3.5 w-3.5" />
              Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs rounded-lg hidden sm:flex"
              onClick={() => navigate(`/apps/${id}/deployments`)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Rollback
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 flex-1 sm:flex-none"
            >
              <Rocket className="h-3.5 w-3.5" />
              Deploy
            </Button>
          </div>
        </div>
      </div>

      <AppSubNav />

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
