import { useState } from "react";
import { useGeneralSettings } from "@/hooks/useSettings";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function GeneralSettingsPage() {
  const { data, isLoading, isError, refetch } = useGeneralSettings();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ platformName: "", defaultRegion: "", defaultBuildTimeout: 600 });

  if (data && !form.platformName) {
    setForm({ platformName: data.platformName, defaultRegion: data.defaultRegion, defaultBuildTimeout: data.defaultBuildTimeout });
  }

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="p-4 sm:p-6 max-w-lg animate-fade-in">
      <h2 className="section-title text-base mb-6">General Settings</h2>
      <div className="space-y-5">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Platform Name</Label>
          <Input value={form.platformName} onChange={(e) => setForm(f => ({ ...f, platformName: e.target.value }))} className="bg-background/60 border-border/40 font-mono text-sm rounded-lg" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Default Region</Label>
          <Input value={form.defaultRegion} onChange={(e) => setForm(f => ({ ...f, defaultRegion: e.target.value }))} className="bg-background/60 border-border/40 font-mono text-sm rounded-lg" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Default Build Timeout (seconds)</Label>
          <Input type="number" value={form.defaultBuildTimeout} onChange={(e) => setForm(f => ({ ...f, defaultBuildTimeout: Number(e.target.value) }))} className="bg-background/60 border-border/40 font-mono text-sm rounded-lg" />
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20">
          <Save className="h-4 w-4" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
