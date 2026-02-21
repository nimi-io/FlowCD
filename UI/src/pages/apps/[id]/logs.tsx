import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useBuilds, useRuntimeLogs } from "@/hooks/useApps";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Copy, Search, ArrowDown, CheckCheck } from "lucide-react";

type LogTab = "build" | "runtime";

function getLogLevel(line: string): "info" | "warn" | "error" | "debug" | "success" {
  if (line.includes("[ERROR]")) return "error";
  if (line.includes("[WARN]")) return "warn";
  if (line.includes("[DEBUG]")) return "debug";
  if (line.includes("success") || line.includes("complete") || line.includes("Successfully")) return "success";
  return "info";
}

function LogLine({ line, number }: { line: string; number: number }) {
  const level = getLogLevel(line);
  return (
    <div className={cn("flex gap-3 px-3 sm:px-4 py-0.5 hover:bg-muted/10 group", `log-line-${level}`)}>
      <span className="font-mono text-[11px] text-muted-foreground/30 select-none w-7 text-right flex-shrink-0 group-hover:text-muted-foreground/50">
        {number}
      </span>
      <span className="font-mono text-[11px] sm:text-xs break-all whitespace-pre-wrap">{line}</span>
    </div>
  );
}

export default function LogsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<LogTab>("runtime");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const buildsQuery = useBuilds(id ?? "");
  const runtimeQuery = useRuntimeLogs(id ?? "");

  const rawBuildLogs = buildsQuery.data?.[0]?.logs ?? [];
  const rawRuntimeLogs = runtimeQuery.data ?? [];
  const rawLogs = tab === "build" ? rawBuildLogs : rawRuntimeLogs;

  useEffect(() => {
    setVisibleCount(0);
    setStreaming(true);
    const interval = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= rawLogs.length) {
          setStreaming(false);
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [tab, rawLogs.length]);

  const displayedLogs = rawLogs.slice(0, visibleCount);
  const filteredLogs = search
    ? displayedLogs.filter((l) => l.toLowerCase().includes(search.toLowerCase()))
    : displayedLogs;

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (buildsQuery.isLoading || runtimeQuery.isLoading) return <PageLoader />;
  if (buildsQuery.isError || runtimeQuery.isError) return <ErrorState />;

  return (
    <div className="flex flex-col h-full min-h-0 p-3 sm:p-6 gap-3 sm:gap-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Tabs */}
        <div className="flex rounded-xl border border-border/60 overflow-hidden bg-muted/20">
          {(["runtime", "build"] as LogTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-colors capitalize flex-1 sm:flex-none",
                tab === t
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              {t} logs
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs font-mono bg-card/60 border-border/60 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {streaming && (
            <div className="flex items-center gap-1.5 text-xs text-status-building">
              <span className="h-1.5 w-1.5 rounded-full bg-status-building animate-pulse" />
              Streaming
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg flex-1 sm:flex-none"
            onClick={() => setAutoScroll((v) => !v)}
          >
            <ArrowDown className={cn("h-3.5 w-3.5", autoScroll && "text-primary")} />
            <span className="hidden sm:inline">Auto-scroll</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-lg flex-1 sm:flex-none" onClick={handleCopy}>
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-status-healthy" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Log viewer */}
      <div
        ref={logRef}
        className="flex-1 bg-background/80 border border-border/40 rounded-xl overflow-auto font-mono min-h-0"
        style={{ minHeight: "300px" }}
      >
        <div className="py-2">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-xs font-mono">
              {streaming ? "Loading logs..." : "No logs match your filter."}
            </div>
          ) : (
            filteredLogs.map((line, i) => (
              <LogLine key={i} line={line} number={i + 1} />
            ))
          )}
          {streaming && (
            <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>{visibleCount}/{rawLogs.length} lines</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
