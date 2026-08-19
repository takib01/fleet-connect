import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BadgeDollarSign, CalendarCheck, CarFront, Plus, Timer } from "lucide-react";
import type { ReactNode } from "react";

import { listRentals } from "@/api/rentals.api";
import { getMonthlyReport } from "@/api/reports.api";
import { listVehicles } from "@/api/vehicles.api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CardGridSkeleton, EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentMonth, formatCurrency, formatDate, formatLongDate, titleCase } from "@/lib/format";

function SummaryCard({
  label,
  value,
  hint,
  icon,
  loading,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function DashboardPage() {
  const month = currentMonth();

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { page: 1, per_page: 100 }],
    queryFn: () => listVehicles({ page: 1, per_page: 100 }),
  });
  const rentalsQuery = useQuery({
    queryKey: ["rentals", { page: 1, per_page: 100 }],
    queryFn: () => listRentals({ page: 1, per_page: 100 }),
  });
  const reportQuery = useQuery({
    queryKey: ["report", month, undefined],
    queryFn: () => getMonthlyReport(month),
  });

  const vehicles = vehiclesQuery.data?.data ?? [];
  const rentals = rentalsQuery.data?.data ?? [];
  const activeRentals = rentals.filter((r) => r.status === "ongoing").length;
  const bookedRentals = rentals.filter((r) => r.status === "booked").length;
  const recent = rentals.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={formatLongDate(new Date())}
        actions={
          <Button asChild>
            <Link to="/rentals/new">
              <Plus className="size-4" /> New Rental
            </Link>
          </Button>
        }
      />

      {vehiclesQuery.isLoading || rentalsQuery.isLoading ? (
        <CardGridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Active Vehicles"
            value={String(vehiclesQuery.data?.total ?? 0)}
            hint="Vehicles currently in the active fleet"
            icon={<CarFront className="size-4" />}
          />
          <SummaryCard
            label="Active Rentals"
            value={String(activeRentals)}
            hint="Rentals currently ongoing"
            icon={<Timer className="size-4" />}
          />
          <SummaryCard
            label="Booked Rentals"
            value={String(bookedRentals)}
            hint="Upcoming confirmed bookings"
            icon={<CalendarCheck className="size-4" />}
          />
          <SummaryCard
            label="Monthly Revenue"
            value={formatCurrency(reportQuery.data?.totals.total_revenue ?? 0)}
            hint="Reported by the server for this month"
            icon={<BadgeDollarSign className="size-4" />}
            loading={reportQuery.isLoading}
          />
        </div>
      )}

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Rentals</h2>
            <p className="text-xs text-muted-foreground">Latest rental activity across the fleet</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/rentals">View all</Link>
          </Button>
        </div>

        {rentalsQuery.isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : rentalsQuery.isError ? (
          <ErrorState message="Rentals could not be loaded." onRetry={() => rentalsQuery.refetch()} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No rentals yet"
            description="Create the first rental to see activity here."
            action={
              <Button asChild size="sm">
                <Link to="/rentals/new">New Rental</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rental period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/rentals/$id"
                        params={{ id: rental.id }}
                        className="hover:text-primary"
                      >
                        {rental.customer_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{rental.vehicle_name}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(rental.total_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rental.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Fleet Snapshot</h2>
            <p className="text-xs text-muted-foreground">A quick look at the active fleet</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/vehicles">Manage fleet</Link>
          </Button>
        </div>

        {vehiclesQuery.isLoading ? (
          <CardGridSkeleton />
        ) : vehiclesQuery.isError ? (
          <div className="panel">
            <ErrorState
              message="Vehicles could not be loaded."
              onRetry={() => vehiclesQuery.refetch()}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {vehicles.slice(0, 4).map((vehicle) => (
              <Link
                key={vehicle.id}
                to="/vehicles/$id"
                params={{ id: vehicle.id }}
                className="panel overflow-hidden transition-colors hover:border-primary/40"
              >
                <img
                  src={vehicle.photo_url ?? ""}
                  alt={vehicle.name}
                  loading="lazy"
                  className="h-32 w-full bg-muted object-cover"
                />
                <div className="space-y-1 p-4">
                  <p className="truncate text-sm font-semibold text-foreground">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.plate_number} · {titleCase(vehicle.category)}
                  </p>
                  <p className="pt-1 text-sm font-medium text-foreground">
                    {formatCurrency(vehicle.daily_rate)}
                    <span className="text-xs font-normal text-muted-foreground"> / day</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
