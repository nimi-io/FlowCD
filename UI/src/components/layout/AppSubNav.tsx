import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", path: "" },
  { label: "Deployments", path: "/deployments" },
  { label: "Builds", path: "/builds" },
  { label: "Logs", path: "/logs" },
  { label: "Env", path: "/env" },
  { label: "Domains", path: "/domains" },
  { label: "Settings", path: "/settings" },
];

export function AppSubNav() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  return (
    <div className="border-b border-border/60 bg-background/40 backdrop-blur-sm">
      <nav className="flex gap-0 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const href = `/apps/${id}${tab.path}`;
          const isActive =
            tab.path === ""
              ? location.pathname === `/apps/${id}` || location.pathname === `/apps/${id}/`
              : location.pathname.startsWith(href);

          return (
            <Link
              key={tab.label}
              to={href}
              className={cn(
                "relative px-3 sm:px-4 py-3 text-[13px] font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
