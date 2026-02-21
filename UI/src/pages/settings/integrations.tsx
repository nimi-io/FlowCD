import { useState } from "react";
import { useIntegrations } from "@/hooks/useSettings";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Integration } from "@/lib/schemas";
import { Github, GitlabIcon, MessageSquare, Container, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  gitlab: GitlabIcon,
  slack: MessageSquare,
  oci_registry: Container,
};

export default function IntegrationsPage() {
  const { data, isLoading, isError, refetch } = useIntegrations();
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  if (data && integrations.length === 0) setIntegrations(data);
  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const toggle = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl animate-fade-in">
      <h2 className="section-title text-base mb-6">Integrations</h2>
      <div className="grid gap-3">
        {integrations.map((int) => {
          const Icon = ICONS[int.type] ?? Container;
          return (
            <div key={int.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{int.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {int.connected ? (int.accountName ?? int.webhookUrl ?? "Connected") : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {int.connected ? (
                  <span className="flex items-center gap-1.5 text-xs text-status-healthy">
                    <Check className="h-3.5 w-3.5" />Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <X className="h-3.5 w-3.5" />Disconnected
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("text-xs rounded-lg", int.connected && "border-destructive/20 text-destructive hover:bg-destructive/10")}
                  onClick={() => toggle(int.id)}
                >
                  {int.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
