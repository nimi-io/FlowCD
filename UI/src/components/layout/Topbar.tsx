import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ChevronRight, Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/hooks/useApps";
import { useCluster } from "@/hooks/useClusters";
import { usePipeline } from "@/hooks/usePipelines";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function useBreadcrumbs() {
  const location = useLocation();
  const { id } = useParams();
  const pathname = location.pathname;

  const appQuery = useApp(pathname.startsWith("/apps/") && id && id !== "new" ? id : "");
  const clusterQuery = useCluster(pathname.startsWith("/clusters/") && id ? id : "");
  const pipelineQuery = usePipeline(pathname.startsWith("/pipelines/") && id ? id : "");

  const crumbs: { label: string; href?: string }[] = [];

  if (pathname === "/apps" || pathname === "/apps/") {
    crumbs.push({ label: "Apps" });
  } else if (pathname === "/apps/new") {
    crumbs.push({ label: "Apps", href: "/apps" }, { label: "New App" });
  } else if (pathname.startsWith("/apps/") && id) {
    const appName = appQuery.data?.name ?? id;
    crumbs.push({ label: "Apps", href: "/apps" }, { label: appName, href: `/apps/${id}` });
    const sub = pathname.split(`/apps/${id}/`)[1];
    if (sub) crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1) });
  } else if (pathname === "/clusters") {
    crumbs.push({ label: "Clusters" });
  } else if (pathname.startsWith("/clusters/") && id) {
    crumbs.push({ label: "Clusters", href: "/clusters" }, { label: clusterQuery.data?.name ?? id });
  } else if (pathname === "/pipelines") {
    crumbs.push({ label: "Pipelines" });
  } else if (pathname.startsWith("/pipelines/") && id) {
    crumbs.push({ label: "Pipelines", href: "/pipelines" }, { label: pipelineQuery.data?.name ?? id });
  } else if (pathname === "/activity") {
    crumbs.push({ label: "Activity" });
  } else if (pathname.startsWith("/settings")) {
    const sub = pathname.split("/settings/")[1];
    crumbs.push({ label: "Settings", href: "/settings/general" });
    if (sub) crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1) });
  } else if (pathname === "/login") {
    crumbs.push({ label: "Login" });
  }

  return crumbs;
}

export function Topbar() {
  const navigate = useNavigate();
  const crumbs = useBreadcrumbs();
  const { state } = useSidebar();

  return (
    <header className="h-12 flex items-center gap-2 px-3 border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-20">
      {state === "collapsed" && (
        <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:text-foreground" />
      )}

      <nav className="flex items-center gap-1 text-sm min-w-0 flex-1">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate text-[13px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate text-[13px]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors ml-0.5">
              <span className="text-[10px] font-mono font-semibold text-muted-foreground">AC</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">Alice Chen</p>
              <p className="text-xs text-muted-foreground">alice@acme.dev</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings/general")} className="text-[13px]">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive text-[13px]"
              onClick={() => navigate("/login")}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
