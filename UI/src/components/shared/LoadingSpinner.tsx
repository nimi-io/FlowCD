import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-border border-t-primary",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 px-4 py-3 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded flex-1" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  );
}
