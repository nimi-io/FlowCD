import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container, Github, Shield } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSSO = () => {
    setTimeout(() => navigate("/apps"), 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 mb-4 shadow-lg shadow-primary/10">
            <Container className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">KubeOps</h1>
          <p className="text-sm text-muted-foreground mt-1">Kubernetes GitOps PaaS</p>
        </div>

        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Sign in to your workspace</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use your organization's SSO provider to authenticate.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-xl h-11 shadow-lg shadow-primary/20"
              onClick={handleSSO}
            >
              <Shield className="h-4 w-4" />
              Sign in with SSO
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl h-11"
              onClick={handleSSO}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Secured with OpenID Connect. Your credentials never leave your IdP.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          KubeOps v2.4.1 · <span className="text-primary/70">acme-corp</span> workspace
        </p>
      </div>
    </div>
  );
}
