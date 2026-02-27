import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApps";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Save, Trash2 } from "lucide-react";
import { deleteApp, MOCK_MODE } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-4 sm:p-5 mb-3">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AppSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: app, isLoading, isError, refetch } = useApp(id ?? "");

  const [name, setName] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [dockerfilePath, setDockerfilePath] = useState("./Dockerfile");
  const [saved, setSaved] = useState(false);

  if (app && !name) {
    setName(app.name);
    setRepo(app.repoUrl);
    setBranch(app.branch);
  }

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="section-title text-base">App Settings</h2>
        <p className="section-subtitle">Manage configuration for {app?.name}</p>
      </div>

      <Section title="General" description="Basic app configuration">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground mb-1.5 block">App Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="font-mono text-sm bg-background/60 border-border/40 rounded-lg" />
          </div>
        </div>
      </Section>

      <Section title="Repository" description="Git repository and branch configuration">
        <div className="space-y-4">
          <div>
            <Label htmlFor="repo" className="text-xs text-muted-foreground mb-1.5 block">Repository URL</Label>
            <Input id="repo" value={repo} onChange={(e) => setRepo(e.target.value)} className="font-mono text-sm bg-background/60 border-border/40 rounded-lg" />
          </div>
          <div>
            <Label htmlFor="branch" className="text-xs text-muted-foreground mb-1.5 block">Branch</Label>
            <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="font-mono text-sm bg-background/60 border-border/40 rounded-lg" />
          </div>
        </div>
      </Section>

      <Section title="Build Configuration" description="Docker build settings">
        <div>
          <Label htmlFor="dockerfile" className="text-xs text-muted-foreground mb-1.5 block">Dockerfile Path</Label>
          <Input id="dockerfile" value={dockerfilePath} onChange={(e) => setDockerfilePath(e.target.value)} className="font-mono text-sm bg-background/60 border-border/40 rounded-lg" />
        </div>
      </Section>

      <div className="flex justify-end mb-8">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20" onClick={handleSave}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-card/80 border border-destructive/20 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Deleting this app will remove all deployments, builds, and configuration. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2 rounded-lg">
              <Trash2 className="h-3.5 w-3.5" />
              Delete App
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {app?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{app?.name}</strong>, including all deployments, builds, logs, and configuration. 
                This action <strong>cannot be undone</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                onClick={async () => {
                  try {
                    if (!MOCK_MODE) await deleteApp(id ?? "");
                    navigate("/apps");
                  } catch {
                    navigate("/apps");
                  }
                }}
              >
                Delete App
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
