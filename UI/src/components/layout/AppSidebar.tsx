import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Server,
  GitBranch,
  Activity,
  Settings,
  Container,
  ChevronsLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      { title: "Apps", url: "/apps", icon: LayoutGrid },
      { title: "Clusters", url: "/clusters", icon: Server },
      { title: "Pipelines", url: "/pipelines", icon: GitBranch },
      { title: "Activity", url: "/activity", icon: Activity },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/settings/general", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/settings/general") return location.pathname.startsWith("/settings");
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Container className="h-4 w-4 text-primary" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="min-w-0 overflow-hidden"
              >
                <span className="text-sm font-semibold text-foreground truncate block leading-tight">KubeOps</span>
                <span className="text-[10px] text-muted-foreground leading-none">GitOps PaaS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={toggleSidebar}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </SidebarHeader>

      <SidebarContent className="py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label} className="mb-1">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 px-2.5 mb-1 font-medium">
                    {section.label}
                  </SidebarGroupLabel>
                </motion.div>
              )}
            </AnimatePresence>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "h-9 rounded-lg transition-all duration-150 group/nav-item",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            active ? "text-primary" : "text-muted-foreground group-hover/nav-item:text-foreground"
                          )} />
                          <span className="text-[13px] font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2.5">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-2.5 px-1 py-1"
            >
              <div className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">AC</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate leading-tight">alice@acme.dev</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Admin</p>
              </div>
              <Link
                to="/login"
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center mx-auto"
            >
              <span className="text-[10px] font-mono font-semibold text-muted-foreground">AC</span>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
