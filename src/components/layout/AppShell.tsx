import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarRange,
  Car,
  LayoutDashboard,
  LogOut,
  Menu,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/rentals", label: "Rentals", icon: CalendarRange },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, ...rest }) => {
        const exact = "exact" in rest ? rest.exact : false;
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Car className="size-4.5" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-foreground">Fleetdesk</p>
        <p className="text-xs text-muted-foreground">Rental operations</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "anonymous") navigate({ to: "/login", replace: true });
  }, [status, navigate]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-6 flex-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>
          <NavLinks />
        </div>
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-foreground">{user?.name ?? "Staff"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => void signOut()}>
            <LogOut className="size-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <div className="mt-6">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full"
                  onClick={() => void signOut()}
                >
                  <LogOut className="size-4" /> Logout
                </Button>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground lg:hidden">Fleetdesk</span>
          </div>
          <div className="hidden text-xs text-muted-foreground lg:block">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
