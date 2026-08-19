import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ReactNode } from "react";

import { ApiError } from "@/api/client";
import { deleteRental, getRental } from "@/api/rentals.api";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, rentalDays } from "@/lib/format";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function RentalDetailsPage() {
  const { id } = useParams({ from: "/rentals/$id/" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const query = useQuery({ queryKey: ["rental", id], queryFn: () => getRental(id) });

  const removeMutation = useMutation({
    mutationFn: () => deleteRental(id),
    onSuccess: () => {
      toast.success("Rental deleted");
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      navigate({ to: "/rentals" });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Could not delete the rental"),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="panel">
        <ErrorState
          title="Rental unavailable"
          message={
            query.error instanceof ApiError ? query.error.message : "This rental could not be loaded."
          }
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const rental = query.data;
  const days = rentalDays(rental.start_date, rental.end_date);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/rentals">
          <ArrowLeft className="size-4" /> Back to rentals
        </Link>
      </Button>

      <PageHeader
        title={`Rental · ${rental.customer_name}`}
        description={`${formatDate(rental.start_date)} → ${formatDate(rental.end_date)} · ${days} ${days === 1 ? "day" : "days"}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/rentals/$id/edit" params={{ id: rental.id }}>
                <Pencil className="size-4" /> Edit Rental
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" /> Delete Rental
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">Customer</h2>
          <dl className="mt-2">
            <Row label="Name" value={rental.customer_name} />
            <Row label="Phone" value={rental.customer_phone} />
          </dl>

          <h2 className="mt-6 text-sm font-semibold text-foreground">Vehicle</h2>
          <dl className="mt-2">
            <Row
              label="Vehicle"
              value={
                <Link
                  to="/vehicles/$id"
                  params={{ id: rental.vehicle_id }}
                  className="hover:text-primary"
                >
                  {rental.vehicle_name ?? rental.vehicle_id}
                </Link>
              }
            />
            {rental.vehicle_plate_number ? (
              <Row label="Plate number" value={rental.vehicle_plate_number} />
            ) : null}
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">Rental</h2>
          <dl className="mt-2">
            <Row label="Start date" value={formatDate(rental.start_date)} />
            <Row label="End date" value={formatDate(rental.end_date)} />
            <Row label="Rental days" value={`${days} ${days === 1 ? "day" : "days"}`} />
            <Row
              label="Total amount"
              value={<span className="text-base">{formatCurrency(rental.total_amount)}</span>}
            />
            <Row label="Status" value={<StatusBadge status={rental.status} />} />
          </dl>
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            The total amount is calculated and stored by the server. A same-day rental counts as one
            rental day.
          </p>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this rental permanently?"
        description="This rental record will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Rental"
        destructive
        loading={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
      />
    </>
  );
}
