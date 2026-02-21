import { useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "@/hooks/useApps";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnvVar } from "@/lib/schemas";
import { Eye, EyeOff, Plus, Trash2, Save, Lock, Variable } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EnvPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading, isError, refetch } = useApp(id ?? "");

  const [vars, setVars] = useState<EnvVar[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  if (app && vars.length === 0 && app.envVars.length > 0) {
    setVars(app.envVars);
  }

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addVar = () => {
    setVars((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, key: "", value: "", isSecret: false },
    ]);
  };

  const updateVar = (varId: string, field: keyof EnvVar, value: string | boolean) => {
    setVars((prev) => prev.map((v) => (v.id === varId ? { ...v, [field]: value } : v)));
  };

  const deleteVar = (varId: string) => {
    setVars((prev) => prev.filter((v) => v.id !== varId));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="section-title text-base">Environment Variables</h2>
          <p className="section-subtitle">{vars.length} variables configured</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg" onClick={addVar}>
            <Plus className="h-3.5 w-3.5" />
            Add Variable
          </Button>
          <Button
            size="sm"
            className={cn(
              "gap-1.5 text-xs rounded-lg transition-all shadow-lg",
              saved
                ? "bg-status-healthy text-primary-foreground hover:bg-status-healthy/90 shadow-status-healthy/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
            )}
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {vars.length === 0 ? (
        <EmptyState
          icon={Variable}
          title="No environment variables"
          description="Add variables to configure your application's runtime environment."
          action={
            <Button size="sm" onClick={addVar} className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {vars.map((v) => (
            <div key={v.id} className="glass-card p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                value={v.key}
                onChange={(e) => updateVar(v.id, "key", e.target.value)}
                placeholder="KEY_NAME"
                className="h-9 font-mono text-xs bg-background/60 border-border/40 rounded-lg sm:w-40"
              />
              <div className="relative flex-1">
                <Input
                  type={v.isSecret && !revealed.has(v.id) ? "password" : "text"}
                  value={v.value}
                  onChange={(e) => updateVar(v.id, "value", e.target.value)}
                  placeholder={v.isSecret ? "••••••••" : "value"}
                  className="h-9 font-mono text-xs bg-background/60 border-border/40 pr-9 rounded-lg"
                />
                {v.isSecret && (
                  <button
                    onClick={() => toggleReveal(v.id)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {revealed.has(v.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateVar(v.id, "isSecret", !v.isSecret)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    v.isSecret ? "text-status-building bg-status-building/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                  title={v.isSecret ? "Secret (masked)" : "Plain text"}
                >
                  <Lock className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteVar(v.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
