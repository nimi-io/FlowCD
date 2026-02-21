import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { label: "General", path: "/settings/general" },
  { label: "Team", path: "/settings/team" },
  { label: "Integrations", path: "/settings/integrations" },
  { label: "Credentials", path: "/settings/credentials" },
  { label: "Notifications", path: "/settings/notifications" },
];

export default function SettingsLayout() {
  return (
    <div className="flex flex-col sm:flex-row min-h-full">
      <aside className="sm:w-48 border-b sm:border-b-0 sm:border-r border-border/40 flex-shrink-0 p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-3 font-semibold hidden sm:block">Settings</p>
        <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap",
                  isActive ? "bg-primary/12 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
