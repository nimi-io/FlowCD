import { useState } from "react";
import { useNotificationRules } from "@/hooks/useSettings";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NotificationRule } from "@/lib/schemas";
import { Webhook, Mail, Save, Eye, EyeOff, Plus, Trash2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_LABELS: Record<string, string> = { deploy_success: "Deployment Success", deploy_fail: "Deployment Failure", build_fail: "Build Failure" };
const CHANNEL_LABELS: Record<string, string> = { email: "Email", slack: "Slack" };

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotificationRules();
  const [rules, setRules] = useState<NotificationRule[]>([]);

  // Webhook state
  const [webhooks, setWebhooks] = useState([
    { id: "wh-1", url: "https://hooks.example.com/deploy-events", secret: "whsec_abc123def456", enabled: true },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // Resend state
  const [resendApiKey, setResendApiKey] = useState("re_abc123xxxxxxxxxxxxxxxxxx");
  const [resendFrom, setResendFrom] = useState("notifications@acme.dev");
  const [resendRevealed, setResendRevealed] = useState(false);
  const [resendSaved, setResendSaved] = useState(false);

  if (data && rules.length === 0) setRules(data);
  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const toggle = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const grouped = rules.reduce<Record<string, NotificationRule[]>>((acc, r) => {
    if (!acc[r.event]) acc[r.event] = [];
    acc[r.event].push(r);
    return acc;
  }, {});

  const addWebhook = () => {
    if (!newWebhookUrl.trim()) return;
    setWebhooks(prev => [
      ...prev,
      { id: `wh-${Date.now()}`, url: newWebhookUrl.trim(), secret: `whsec_${Math.random().toString(36).slice(2, 14)}`, enabled: true },
    ]);
    setNewWebhookUrl("");
  };

  const removeWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const handleResendSave = () => {
    setResendSaved(true);
    setTimeout(() => setResendSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg animate-fade-in">
      <h2 className="section-title text-base mb-6">Notification Rules</h2>

      {/* Event-based rules */}
      <div className="space-y-3 mb-8">
        {Object.entries(grouped).map(([event, eventRules]) => (
          <div key={event} className="glass-card p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">{EVENT_LABELS[event] ?? event}</h3>
            <div className="space-y-3">
              {eventRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{CHANNEL_LABELS[rule.channel] ?? rule.channel}</span>
                  <Switch checked={rule.enabled} onCheckedChange={() => toggle(rule.id)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Webhook className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Webhooks</h3>
            <p className="text-[11px] text-muted-foreground">Receive HTTP POST callbacks for events</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="glass-card p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    wh.enabled ? "bg-status-healthy" : "bg-status-idle"
                  )} />
                  <span className="font-mono text-xs text-foreground truncate">{wh.url}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch
                    checked={wh.enabled}
                    onCheckedChange={() => toggleWebhook(wh.id)}
                    className="scale-90"
                  />
                  <button
                    onClick={() => removeWebhook(wh.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Secret:</span>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                  {wh.secret.slice(0, 10)}••••••
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="https://your-endpoint.com/webhook"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWebhook()}
            className="font-mono text-xs bg-background/60 border-border/40 rounded-lg h-9 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs rounded-lg h-9"
            onClick={addWebhook}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Resend Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resend</h3>
            <p className="text-[11px] text-muted-foreground">Send transactional emails via Resend API</p>
          </div>
        </div>

        <div className="glass-card p-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">API Key</Label>
            <div className="relative">
              <Input
                type={resendRevealed ? "text" : "password"}
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="font-mono text-xs bg-background/60 border-border/40 rounded-lg pr-9"
              />
              <button
                onClick={() => setResendRevealed(!resendRevealed)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {resendRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">From Address</Label>
            <Input
              value={resendFrom}
              onChange={(e) => setResendFrom(e.target.value)}
              placeholder="noreply@yourdomain.com"
              className="font-mono text-xs bg-background/60 border-border/40 rounded-lg"
            />
          </div>

          <Button
            size="sm"
            className={cn(
              "gap-1.5 text-xs rounded-lg transition-all shadow-lg",
              resendSaved
                ? "bg-status-healthy text-primary-foreground shadow-status-healthy/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
            )}
            onClick={handleResendSave}
          >
            {resendSaved ? <CheckCheck className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {resendSaved ? "Saved!" : "Save Resend Config"}
          </Button>
        </div>
      </div>
    </div>
  );
}
