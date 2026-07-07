import { useState } from "react";
import { cn } from "../../lib/utils.js";

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;

  const handleChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {typeof children === "function"
        ? children({ activeValue, onValueChange: handleChange })
        : children}
    </div>
  );
}

export function TabsList({ activeValue, onValueChange, children, className }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-card p-1 text-text-secondary",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, activeValue, onValueChange, children, className }) {
  const isActive = activeValue === value;
  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className }) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className, activeValue !== value && "hidden")}>
      {children}
    </div>
  );
}
