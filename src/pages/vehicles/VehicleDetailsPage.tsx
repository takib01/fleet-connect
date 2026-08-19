import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarRange, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { deleteVehicle, getVehicle } from "@/api/vehicles.api";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function VehicleDetailsPage() {
  const { id } = useParams({ from: "/vehicles/$id/" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const query = useQuery({ queryKey: ["vehicle", id], queryFn: () => getVehicle(id) });

  const removeMutation = useMutation({
    mutationFn: () => deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle removed from the active fleet");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate({ to: "/vehicles" });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Could not remove the vehicle"),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="panel">
        <ErrorState
          title="Vehicle unavailable"
          message={
            query.error instanceof ApiError
              ? query.error.message
              : "This vehicle could not be loaded."
          }
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const vehicle = query.data;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/vehicles">
          <ArrowLeft className="size-4" /> Back to vehicles
        </Link>
      </Button>

      <PageHeader
        title={vehicle.name}
        description={`${vehicle.plate_number} · ${titleCase(vehicle.category)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/vehicles/$id/edit" params={{ id: vehicle.id }}>
                <Pencil className="size-4" /> Edit Vehicle
              </Link>
            </Button>
            <Button variant="outline" className="text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" /> Delete Vehicle
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="panel overflow-hidden lg:col-span-3">
          <img
            src={vehicle.photo_url ?? ""}
            alt={vehicle.name}
            className="aspect-video w-full bg-muted object-cover"
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Vehicle details</h2>
            <dl className="mt-2">
              <DetailRow label="Vehicle name" value={vehicle.name} />
              <DetailRow label="Plate number" value={vehicle.plate_number} />
              <DetailRow label="Category" value={titleCase(vehicle.category)} />
              <DetailRow label="Daily rate" value={`${formatCurrency(vehicle.daily_rate)} / day`} />
              {vehicle.created_at ? (
                <DetailRow label="Added on" value={formatDate(vehicle.created_at)} />
              ) : null}
            </dl>
          </div>

          <div className="panel p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <CalendarRange className="size-4" />
              </span>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Rental activity</p>
                <p className="text-sm text-muted-foreground">
                  Bookings, availability and totals for this vehicle are managed from Rentals. The
                  server validates availability when a rental is created or updated.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/rentals" search={{ vehicle: vehicle.id }}>
                    View rentals for this vehicle
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove this vehicle from the active fleet?"
        description="The vehicle will no longer be available for new rentals. Historical rental records will remain preserved."
        confirmLabel="Remove Vehicle"
        loading={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
      />
    </>
  );
}
