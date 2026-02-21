import { useState } from "react";
import { useCredentials } from "@/hooks/useSettings";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Credential } from "@/lib/schemas";
import { Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

export default function CredentialsPage() {
  const { data, isLoading, isError, refetch } = useCredentials();
  const [creds, setCreds] = useState<Credential[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (data && creds.length === 0) setCreds(data);
  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const TYPE_LABELS: Record<string, string> = { ssh_key: "SSH Key", registry_secret: "Registry Secret", api_token: "API Token" };

  return (
    <div className="p-4 sm:p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title text-base">Credentials</h2>
        <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20">
          <Plus className="h-3.5 w-3.5" />Add Credential
        </Button>
      </div>
      <div className="space-y-2">
        {creds.map((cred) => (
          <div key={cred.id} className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                <Key className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-mono text-foreground truncate">{cred.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-md">{TYPE_LABELS[cred.type]}</span>
                  <span className="text-[10px] text-muted-foreground">Added {format(new Date(cred.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {revealed.has(cred.id) ? cred.value.slice(0, 20) + "..." : "••••••••••••"}
              </span>
              <button onClick={() => setRevealed(p => { const n = new Set(p); n.has(cred.id) ? n.delete(cred.id) : n.add(cred.id); return n; })} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                {revealed.has(cred.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => setCreds(c => c.filter(x => x.id !== cred.id))} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
