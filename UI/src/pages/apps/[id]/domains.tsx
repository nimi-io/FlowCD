import { useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "@/hooks/useApps";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Domain } from "@/lib/schemas";
import { Globe, Plus, Trash2, ShieldCheck, RefreshCw } from "lucide-react";

export default function DomainsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading, isError, refetch } = useApp(id ?? "");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);

  if (app && domains.length === 0 && app.domains.length > 0 && !adding) {
    setDomains(app.domains);
  }

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const handleAdd = () => {
    if (!newDomain.trim()) return;
    setDomains((prev) => [
      ...prev,
      { id: `dom-${Date.now()}`, domain: newDomain.trim(), sslStatus: "pending" },
    ]);
    setNewDomain("");
    setAdding(false);
  };

  const handleDelete = (domId: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== domId));
  };

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="section-title text-base">Custom Domains</h2>
          <p className="section-subtitle">{domains.length} domains configured</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Domain
        </Button>
      </div>

      {adding && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            placeholder="my-app.example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="font-mono text-sm bg-card/60 border-border/60 h-9 rounded-lg flex-1"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex-1 sm:flex-none">
              Add
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setNewDomain(""); }} className="rounded-lg flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {domains.length === 0 && !adding ? (
        <EmptyState
          icon={Globe}
          title="No custom domains"
          description="Add custom domains to make your app accessible via your own URLs."
          action={
            <Button size="sm" onClick={() => setAdding(true)} className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono text-sm text-foreground truncate">{domain.domain}</span>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <StatusBadge status={domain.sslStatus} />
                <div className="flex items-center gap-1">
                  {domain.sslStatus !== "valid" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Retry SSL">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDelete(domain.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {domains.some((d) => d.sslStatus === "valid") && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-status-healthy" />
          SSL certificates are managed automatically via cert-manager.
        </div>
      )}
    </div>
  );
}
