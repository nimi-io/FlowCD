import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Check, GitBranch, Settings, Variable, Globe, Rocket, Plus, Trash2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Repository", icon: GitBranch },
  { id: 2, label: "Build Config", icon: Settings },
  { id: 3, label: "Environment", icon: Variable },
  { id: 4, label: "Domains", icon: Globe },
  { id: 5, label: "Review", icon: Rocket },
];

const Step1Schema = z.object({
  repoUrl: z.string().url("Must be a valid URL"),
  branch: z.string().min(1, "Branch is required"),
});

const Step2Schema = z.object({
  dockerfilePath: z.string().min(1, "Dockerfile path is required"),
});

export default function NewAppPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    repoUrl: "",
    branch: "main",
    dockerfilePath: "./Dockerfile",
    buildArgs: "",
    envVars: [{ key: "", value: "", isSecret: false }],
    domains: [""],
  });

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    try {
      if (step === 1) Step1Schema.parse({ repoUrl: form.repoUrl, branch: form.branch });
      if (step === 2) Step2Schema.parse({ dockerfilePath: form.dockerfilePath });
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) errs[String(err.path[0])] = err.message;
        });
        setErrors(errs);
      }
      return false;
    }
  };

  const next = () => {
    if (validate()) setStep((s) => Math.min(s + 1, 5));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const deploy = () => {
    setSubmitting(true);
    setTimeout(() => navigate("/apps"), 1500);
  };

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Deploy New App</h1>
        <p className="section-subtitle">Configure and deploy your application</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center border-2 transition-all",
                  step > s.id
                    ? "bg-status-healthy border-status-healthy text-primary-foreground"
                    : step === s.id
                    ? "bg-primary/12 border-primary text-primary"
                    : "bg-muted/40 border-border/60 text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-[10px] mt-1.5 font-medium whitespace-nowrap", step === s.id ? "text-primary" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-2 mt-[-14px]", step > s.id ? "bg-status-healthy" : "bg-border/40")} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="glass-card p-5 sm:p-6 mb-6 animate-fade-in">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Repository</h2>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Repository URL *</Label>
              <Input
                value={form.repoUrl}
                onChange={(e) => update("repoUrl", e.target.value)}
                placeholder="https://github.com/org/repo"
                className={cn("font-mono text-sm bg-background/60 border-border/40 rounded-lg", errors.repoUrl && "border-destructive")}
              />
              {errors.repoUrl && <p className="text-xs text-destructive mt-1">{errors.repoUrl}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Branch *</Label>
              <Input
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                placeholder="main"
                className={cn("font-mono text-sm bg-background/60 border-border/40 rounded-lg", errors.branch && "border-destructive")}
              />
              {errors.branch && <p className="text-xs text-destructive mt-1">{errors.branch}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Build Configuration</h2>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Dockerfile Path *</Label>
              <Input
                value={form.dockerfilePath}
                onChange={(e) => update("dockerfilePath", e.target.value)}
                placeholder="./Dockerfile"
                className={cn("font-mono text-sm bg-background/60 border-border/40 rounded-lg", errors.dockerfilePath && "border-destructive")}
              />
              {errors.dockerfilePath && <p className="text-xs text-destructive mt-1">{errors.dockerfilePath}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Build Args (KEY=VALUE, one per line)</Label>
              <textarea
                value={form.buildArgs}
                onChange={(e) => update("buildArgs", e.target.value)}
                placeholder={"NODE_ENV=production\nAPI_URL=https://api.example.com"}
                rows={4}
                className="w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Environment Variables</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-lg"
                onClick={() => update("envVars", [...form.envVars, { key: "", value: "", isSecret: false }])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.envVars.map((env, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={env.key}
                    onChange={(e) => {
                      const next = [...form.envVars];
                      next[i] = { ...next[i], key: e.target.value };
                      update("envVars", next);
                    }}
                    placeholder="KEY"
                    className="font-mono text-xs bg-background/60 border-border/40 rounded-lg"
                  />
                  <Input
                    value={env.value}
                    onChange={(e) => {
                      const next = [...form.envVars];
                      next[i] = { ...next[i], value: e.target.value };
                      update("envVars", next);
                    }}
                    placeholder="value"
                    className="font-mono text-xs bg-background/60 border-border/40 flex-1 rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => update("envVars", form.envVars.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Custom Domains</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-lg"
                onClick={() => update("domains", [...form.domains, ""])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Domain
              </Button>
            </div>
            <div className="space-y-2">
              {form.domains.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={d}
                    onChange={(e) => {
                      const next = [...form.domains];
                      next[i] = e.target.value;
                      update("domains", next);
                    }}
                    placeholder="my-app.example.com"
                    className="font-mono text-sm bg-background/60 border-border/40 rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => update("domains", form.domains.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">Review & Deploy</h2>
            <div className="space-y-3">
              {[
                { label: "Repository", value: form.repoUrl || "—" },
                { label: "Branch", value: form.branch },
                { label: "Dockerfile", value: form.dockerfilePath },
                { label: "Env Variables", value: `${form.envVars.filter((e) => e.key).length} configured` },
                { label: "Domains", value: form.domains.filter((d) => d).join(", ") || "None" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between border-b border-border/30 pb-2.5 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-mono text-foreground text-right max-w-xs truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prev}
          disabled={step === 1}
          className="gap-2 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 5 ? (
          <Button onClick={next} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={deploy}
            disabled={submitting}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20"
          >
            <Rocket className="h-4 w-4" />
            {submitting ? "Deploying..." : "Deploy App"}
          </Button>
        )}
      </div>
    </div>
  );
}
