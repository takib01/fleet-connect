import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, rentalDays } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}

export function FilterBar({
  children,
  onClear,
  active,
}: {
  children: ReactNode;
  onClear: () => void;
  active: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:flex-wrap lg:items-center">
      {children}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={!active}
        className="lg:ml-auto"
      >
        <X className="size-4" /> Clear filters
      </Button>
    </div>
  );
}

export function CurrencyDisplay({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-medium tabular-nums text-foreground", className)}>
      {formatCurrency(value)}
    </span>
  );
}

export function DateRangeDisplay({ start, end }: { start: string; end: string }) {
  const days = rentalDays(start, end);
  return (
    <span className="text-sm text-foreground">
      {formatDate(start)} → {formatDate(end)}
      <span className="ml-2 text-xs text-muted-foreground">
        ({days} {days === 1 ? "day" : "days"})
      </span>
    </span>
  );
}
