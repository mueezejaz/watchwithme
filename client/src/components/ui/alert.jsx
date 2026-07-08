import { cn } from "../../lib/utils.js";

const variantStyles = {
  default: "bg-card border-border text-foreground",
  destructive: "border-error/30 bg-error/10 text-error",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-green-500/30 bg-green-500/10 text-green-600",
};

export function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}
