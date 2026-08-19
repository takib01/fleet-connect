import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ApiError } from "@/api/client";
import { createVehicle, getVehicle, updateVehicle } from "@/api/vehicles.api";
import { ImageUpload } from "@/components/common/ImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { titleCase } from "@/lib/format";
import { VEHICLE_CATEGORIES } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Vehicle name is required").max(120),
  plate_number: z
    .string()
    .trim()
    .min(3, "Plate number is required")
    .max(20)
    .regex(/^[A-Za-z0-9- ]+$/, "Use letters, numbers, spaces or dashes only"),
  category: z.enum(["sedan", "suv", "hatchback", "van", "pickup", "luxury"]),
  daily_rate: z
    .number({ invalid_type_error: "Daily rate is required" })
    .positive("Daily rate must be greater than 0")
    .max(100000),
});

type VehicleValues = z.infer<typeof schema>;

export function VehicleFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams({ strict: false });
  const id = (params as { id?: string }).id;

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const vehicleQuery = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => getVehicle(id!),
    enabled: mode === "edit" && Boolean(id),
  });

  const form = useForm<VehicleValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", plate_number: "", category: "sedan", daily_rate: 0 },
  });

  useEffect(() => {
    if (mode === "edit" && vehicleQuery.data) {
      form.reset({
        name: vehicleQuery.data.name,
        plate_number: vehicleQuery.data.plate_number,
        category: vehicleQuery.data.category,
        daily_rate: vehicleQuery.data.daily_rate,
      });
    }
  }, [mode, vehicleQuery.data, form]);

  const mutation = useMutation({
    mutationFn: async (values: VehicleValues) => {
      const body = new FormData();
      body.set("name", values.name);
      body.set("plate_number", values.plate_number);
      body.set("category", values.category);
      body.set("daily_rate", String(values.daily_rate));
      if (photo) body.set("photo", photo);
      return mode === "create" ? createVehicle(body) : updateVehicle(id!, body);
    },
    onSuccess: (vehicle) => {
      toast.success(mode === "create" ? "Vehicle added" : "Vehicle updated");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicle.id] });
      navigate({ to: "/vehicles/$id", params: { id: vehicle.id } });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            if (field in form.getValues()) {
              form.setError(field as keyof VehicleValues, { message });
            }
          });
        }
        setSubmitError(
          error.status === 409
            ? "A vehicle with this plate number already exists. Plate numbers must be unique."
            : error.message,
        );
      } else {
        setSubmitError("Could not save the vehicle. Please try again.");
      }
    },
  });

  const onSubmit = (values: VehicleValues) => {
    setSubmitError(null);
    if (mode === "create" && !photo) {
      setPhotoError("A vehicle photo is required.");
      return;
    }
    mutation.mutate(values);
  };

  if (mode === "edit" && vehicleQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (mode === "edit" && vehicleQuery.isError) {
    return (
      <div className="panel">
        <ErrorState
          title="Vehicle unavailable"
          message="This vehicle could not be loaded for editing."
          onRetry={() => vehicleQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/vehicles">
          <ArrowLeft className="size-4" /> Back to vehicles
        </Link>
      </Button>

      <PageHeader
        title={mode === "create" ? "Add Vehicle" : "Edit Vehicle"}
        description={
          mode === "create"
            ? "Register a new vehicle in the active fleet."
            : "Update vehicle details. Leave the photo unchanged to keep the current image."
        }
      />

      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save vehicle</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 lg:grid-cols-5"
          noValidate
        >
          <div className="panel space-y-5 p-5 lg:col-span-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota Corolla Altis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="DHA-1129" className="uppercase" {...field} />
                    </FormControl>
                    <FormDescription>Plate numbers must be unique across the fleet.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VEHICLE_CATEGORIES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {titleCase(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step="1"
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="panel space-y-4 p-5 lg:col-span-2">
            <div>
              <p className="text-sm font-medium text-foreground">Vehicle Photo</p>
              <p className="text-xs text-muted-foreground">
                {mode === "edit"
                  ? "Upload a new image to replace the current photo."
                  : "Uploaded with the vehicle as multipart/form-data."}
              </p>
            </div>
            <ImageUpload
              file={photo}
              existingUrl={mode === "edit" ? vehicleQuery.data?.photo_url : null}
              onChange={(file, error) => {
                setPhoto(file);
                setPhotoError(error);
              }}
              {...(photoError ? { error: photoError } : {})}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:col-span-5">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "create" ? "Add Vehicle" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/vehicles" })}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
