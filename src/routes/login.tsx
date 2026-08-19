import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff Sign In · Fleetdesk Rental Operations" },
      {
        name: "description",
        content:
          "Secure staff sign in for the Fleetdesk vehicle rental operations dashboard: fleet, rentals and monthly reports.",
      },
      { property: "og:title", content: "Staff Sign In · Fleetdesk Rental Operations" },
      {
        property: "og:description",
        content: "Secure staff sign in for the Fleetdesk vehicle rental operations dashboard.",
      },
    ],
  }),
  component: LoginPage,
});
