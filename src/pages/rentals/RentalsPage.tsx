import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarRange, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { deleteRental, listRentals } from "@/api/rentals.api";
import { listVehicles } from "@/api/vehicles.api";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FilterBar, SearchInput } from "@/components/common/inputs";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { RENTAL_STATUSES, type Rental } from "@/types";

const PER_PAGE = 8;

export function RentalsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Rental | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const filtersActive =
    search !== "" || vehicleId !== "all" || status !== "all" || startDate !== "" || endDate !== "";

  const params = {
    page,
    per_page: PER_PAGE,
    search: debouncedSearch,
    vehicle_id: vehicleId === "all" ? "" : vehicleId,
    status: status === "all" ? "" : status,
    start_date: startDate,
    end_date: endDate,
  };

  const query = useQuery({ queryKey: ["rentals", params], queryFn: () => listRentals(params) });
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { page: 1, per_page: 100 }],
    queryFn: () => listVehicles({ page: 1, per_page: 100 }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRental(id),
    onSuccess: () => {
      toast.success("Rental deleted");
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Could not delete the rental"),
  });

  const clearFilters = () => {
    setSearch("");
    setVehicleId("all");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const rows = query.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Rentals"
        description="Create bookings and track rental activity. Availability is validated by the server."
        actions={
          <Button asChild>
            <Link to="/rentals/new">
              <Plus className="size-4" /> New Rental
            </Link>
          </Button>
        }
      />

      <section className="panel overflow-hidden">
        <FilterBar onClear={clearFilters} active={filtersActive}>
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search customer or vehicle"
            className="w-full lg:w-64"
          />
          <Select
            value={vehicleId}
            onValueChange={(value) => {
              setVehicleId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-52">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
              {(vehiclesQuery.data?.data ?? []).map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {RENTAL_STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {titleCase(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(1);
                }}
                className="w-full lg:w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">End date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(1);
                }}
                className="w-full lg:w-40"
              />
            </div>
          </div>
        </FilterBar>

        {query.isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof ApiError ? query.error.message : "Rentals could not be loaded."
            }
            onRetry={() => query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<CalendarRange className="size-5" />}
            title={filtersActive ? "No rentals match these filters" : "No rentals yet"}
            description={
              filtersActive
                ? "Adjust the vehicle, status or date range, or clear the filters."
                : "Create the first rental to start tracking bookings."
            }
            action={
              filtersActive ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/rentals/new">New Rental</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((rental) => (
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
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {rental.customer_phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rental.vehicle_name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(rental.start_date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(rental.end_date)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(rental.total_amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={rental.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View rental"
                            onClick={() =>
                              navigate({ to: "/rentals/$id", params: { id: rental.id } })
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit rental"
                            onClick={() =>
                              navigate({ to: "/rentals/$id/edit", params: { id: rental.id } })
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete rental"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(rental)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={query.data?.page ?? 1}
              totalPages={query.data?.total_pages ?? 1}
              total={query.data?.total ?? 0}
              perPage={PER_PAGE}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this rental permanently?"
        description={
          <span>
            The rental for{" "}
            <strong className="text-foreground">{pendingDelete?.customer_name}</strong> will be
            permanently deleted. This cannot be undone.
          </span>
        }
        confirmLabel="Delete Rental"
        destructive
        loading={removeMutation.isPending}
        onConfirm={() => pendingDelete && removeMutation.mutate(pendingDelete.id)}
      />
    </>
  );
}
