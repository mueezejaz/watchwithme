import { cn } from "@/app/lib/utils";

const variantStyles = {
  default: "bg-primary text-white shadow hover:opacity-90",
  destructive: "bg-error text-white shadow hover:opacity-90",
  outline: "border border-border bg-transparent shadow-sm hover:bg-card",
  secondary: "bg-card text-foreground shadow-sm hover:opacity-80",
  ghost: "hover:bg-card",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
