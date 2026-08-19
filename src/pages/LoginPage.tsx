import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Car, Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/api/auth.api";
import { ApiError, getToken } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "staff@rentals.test", password: "password123" },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setExpired(new URLSearchParams(window.location.search).has("expired"));
    if (getToken()) navigate({ to: "/", replace: true });
  }, [navigate]);

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate({ to: "/", replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setFormError("Too many sign-in attempts. Please wait a moment before trying again.");
      } else if (error instanceof ApiError && (error.status === 401 || error.status === 422)) {
        setFormError("Invalid email or password. Please check your credentials and try again.");
      } else {
        setFormError(
          error instanceof ApiError ? error.message : "Unable to sign in right now. Try again.",
        );
      }
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Car className="size-5" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Fleetdesk Staff Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage the fleet, rentals and monthly reporting.
          </p>
        </div>

        <div className="panel p-6">
          {expired ? (
            <Alert className="mb-4">
              <LockKeyhole className="size-4" />
              <AlertTitle>Session expired</AlertTitle>
              <AlertDescription>
                Staff sessions last one hour. Please sign in again to continue.
              </AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="staff@rentals.test"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Demo credentials · <span className="font-medium">staff@rentals.test</span> /{" "}
            <span className="font-medium">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
