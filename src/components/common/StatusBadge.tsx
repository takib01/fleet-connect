import { cn } from "@/lib/utils";
import type { RentalStatus } from "@/types";

const styles: Record<RentalStatus, string> = {
  booked: "bg-info/10 text-info border-info/20",
  ongoing: "bg-success/10 text-success border-success/25",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const labels: Record<RentalStatus, string> = {
  booked: "Booked",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: { status: RentalStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
