import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container, Github, Shield, Loader2 } from "lucide-react";
import { loginUser } from "@/lib/api/auth";
import { setStoredToken } from "@/hooks/useAuth";
import { MOCK_MODE } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@flowcd.io");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (MOCK_MODE) {
        // In mock mode, accept any credentials and store a fake token.
        await new Promise((r) => setTimeout(r, 600));
        setStoredToken("mock-session-token");
        navigate("/apps");
      } else {
        const { token } = await loginUser(email, password);
        setStoredToken(token);
        navigate("/apps");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = () => {
    // SSO / GitHub: in mock mode just grant access.
    setStoredToken("mock-session-token");
    navigate("/apps");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 mb-4 shadow-lg shadow-primary/10">
            <Container className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">FlowCD</h1>
          <p className="text-sm text-muted-foreground mt-1">Kubernetes GitOps PaaS</p>
        </div>

        <div className="glass-card p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Sign in to your workspace</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_MODE
                ? "Demo mode — any credentials work."
                : "Enter your credentials to continue."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="font-mono text-sm bg-background/60 border-border/40 rounded-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs text-muted-foreground mb-1.5 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/60 border-border/40 rounded-lg"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-xl h-11 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl h-10 text-sm"
              onClick={handleSSO}
              type="button"
            >
              <Shield className="h-4 w-4" />
              Sign in with SSO
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl h-10 text-sm"
              onClick={handleSSO}
              type="button"
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="mt-5 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Secured with OpenID Connect / JWT.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          FlowCD v1.0 · GitOps PaaS
        </p>
      </div>
    </div>
  );
}
