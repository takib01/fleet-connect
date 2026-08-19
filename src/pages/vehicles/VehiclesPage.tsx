import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Car, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { deleteVehicle, listVehicles } from "@/api/vehicles.api";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar, SearchInput } from "@/components/common/inputs";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, titleCase } from "@/lib/format";
import { VEHICLE_CATEGORIES, type Vehicle } from "@/types";

const PER_PAGE = 8;

export function VehiclesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const filtersActive = search !== "" || category !== "all";

  const params = {
    page,
    per_page: PER_PAGE,
    search: debouncedSearch,
    category: category === "all" ? "" : category,
  };

  const query = useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => listVehicles(params),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle removed from the active fleet");
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not remove the vehicle");
    },
  });

  const rows = query.data?.data ?? [];

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage the active rental fleet, pricing and vehicle records."
        actions={
          <Button asChild>
            <Link to="/vehicles/new">
              <Plus className="size-4" /> Add Vehicle
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
            placeholder="Search by vehicle name"
            className="w-full lg:w-72"
          />
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {VEHICLE_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {titleCase(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBar>

        {query.isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof ApiError ? query.error.message : "Vehicles could not be loaded."
            }
            onRetry={() => query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Car className="size-5" />}
            title={filtersActive ? "No vehicles match these filters" : "No vehicles in the fleet"}
            description={
              filtersActive
                ? "Try a different vehicle name or category, or clear the filters."
                : "Add your first vehicle to start creating rentals."
            }
            action={
              filtersActive ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/vehicles/new">Add Vehicle</Link>
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
                    <TableHead className="w-20">Photo</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Daily Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <img
                          src={vehicle.photo_url ?? ""}
                          alt={vehicle.name}
                          loading="lazy"
                          className="h-10 w-14 rounded-md bg-muted object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to="/vehicles/$id"
                          params={{ id: vehicle.id }}
                          className="hover:text-primary"
                        >
                          {vehicle.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase text-muted-foreground">
                        {vehicle.plate_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {titleCase(vehicle.category)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(vehicle.daily_rate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View vehicle"
                            onClick={() =>
                              navigate({ to: "/vehicles/$id", params: { id: vehicle.id } })
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit vehicle"
                            onClick={() =>
                              navigate({ to: "/vehicles/$id/edit", params: { id: vehicle.id } })
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove vehicle"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(vehicle)}
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
        title="Remove this vehicle from the active fleet?"
        description={
          <span>
            <strong className="text-foreground">{pendingDelete?.name}</strong> will no longer appear
            in the fleet or be selectable for new rentals. Historical rental records for this
            vehicle remain preserved.
          </span>
        }
        confirmLabel="Remove Vehicle"
        loading={removeMutation.isPending}
        onConfirm={() => pendingDelete && removeMutation.mutate(pendingDelete.id)}
      />
    </>
  );
}
