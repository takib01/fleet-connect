# Fleet Connect

Create a polished, production-quality staff dashboard frontend for a Vehicle Rental Management System.

This frontend is a companion/demo client for an existing backend assignment. Do not invent additional business features. The frontend should visually demonstrate the backend capabilities clearly and make the project impressive during a technical review.

Tech Stack

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

React Router

TanStack Query for API/server state

React Hook Form

Zod for frontend form validation

Lucide icons

Recharts only where useful for reporting visualization

Keep the architecture clean, simple, and easy for a developer to explain.

Do NOT use Firebase, Supabase, or another backend/database.

All real data must eventually come from the provided REST API.

Use mock data temporarily so the complete UI can be previewed before connecting the backend.

Product

This system is used internally by staff at a small vehicle rental company.

Staff must be able to:

Log in

Manage the vehicle fleet

Create and manage rentals

Prevent obvious conflicting booking attempts through good UI feedback

Review monthly rental activity and revenue

The backend remains the source of truth for availability, pricing, validation, overlap detection, authentication, and reporting calculations.

Never calculate authoritative rental totals or booking availability only on the frontend.

Design Direction

Create a modern B2B operations dashboard.

Visual style:

Clean

Professional

Minimal

High information density without feeling crowded

Desktop-first but fully responsive

White/light-neutral surfaces

Subtle borders

Soft shadows

Rounded cards

Strong typography hierarchy

One restrained primary accent color

Clear status badges

Avoid gradients unless extremely subtle

Avoid oversized marketing-style components

Avoid unnecessary animations

This is an internal staff application, not a consumer car-rental landing page.

Use a left sidebar on desktop and collapsible navigation on smaller devices.

Navigation:

Dashboard

Vehicles

Rentals

Reports

Logout

1. Login Page

Route:

/login

Create a professional centered staff login screen.

Fields:

Email

Password

Actions:

Sign In

Include:

loading state

invalid credentials message

validation errors

rate-limit-friendly generic error state

Backend endpoint:

POST /auth/login

On successful login:

store the JWT appropriately for this demo client

redirect to Dashboard

attach JWT to protected API requests

All application routes except /login should require authentication.

JWT expires after 1 hour, so handle unauthorized/expired sessions gracefully by returning the user to login.

2. Dashboard

Route:

/

Create an operational overview.

Top section:

Page title: Dashboard

Current date

Primary CTA: New Rental

Summary cards:

Total Active Vehicles

Active Rentals

Booked Rentals

Monthly Revenue

Below the cards include:

Recent Rentals

Compact table showing:

Customer

Vehicle

Rental period

Amount

Status

Fleet Snapshot

Show several vehicles in compact cards with:

photo

vehicle name

plate number

category

daily rate

The dashboard is only a useful summary UI.

Do not create backend endpoints specifically for dashboard analytics if the existing endpoints can supply the information.

3. Vehicles Page

Route:

/vehicles

Use:

GET /vehicles

Support the backend capabilities:

pagination

category filtering

vehicle name search

Page header:

Vehicles

CTA:

Add Vehicle

Toolbar:

Search by vehicle name

Category dropdown

Clear filters

Display vehicles using a clean responsive data table on desktop.

Columns:

Photo

Vehicle

Plate Number

Category

Daily Rate

Actions

Vehicle name cell can include the thumbnail and name together.

Actions:

View

Edit

Delete

Include:

empty state

loading skeleton

API error state

pagination controls

Do not display soft-deleted vehicles.

4. Vehicle Details

Route:

/vehicles/:id

Use:

GET /vehicles/:id

Show:

Large vehicle image

Vehicle name

Plate number

Category

Daily rate

Created date where available

Actions:

Edit Vehicle

Delete Vehicle

Include a compact section explaining that rental activity for the vehicle is managed from Rentals.

Do not invent vehicle fields that do not exist in the API.

5. Add Vehicle

Route:

/vehicles/new

Use:

POST /vehicles

The API requires multipart/form-data.

Form fields:

Vehicle Name

Plate Number

Category

Daily Rate

Vehicle Photo

Photo UI:

drag/drop or upload area

preview selected image

replace selected image before submission

Validation:

required fields

valid positive daily rate

sensible image validation

Submit button:

Add Vehicle

Handle duplicate plate number errors clearly.

6. Edit Vehicle

Route:

/vehicles/:id/edit

Use:

PUT /vehicles/:id

Populate the existing vehicle details.

Allow editing:

Name

Plate Number

Category

Daily Rate

Photo

Show existing image and allow staff to replace it.

Keep the current image if a replacement is not selected.

7. Vehicle Delete Interaction

Use:

DELETE /vehicles/:id

Vehicle deletion is a soft delete.

Use a confirmation modal.

Message:

“Remove this vehicle from the active fleet?”

Explain briefly that historical rental records will remain preserved.

Buttons:

Cancel

Remove Vehicle

Do not imply that rental history will be deleted.

8. Rentals Page

Route:

/rentals

Use:

GET /rentals

Support:

vehicle filtering

status filtering

date-range filtering

pagination where supported

search where supported

Header:

Rentals

Primary CTA:

New Rental

Filters:

Vehicle

Status

Start Date

End Date

Clear Filters

Rental statuses:

booked

ongoing

completed

cancelled

Use visually distinct but restrained status badges.

Table columns:

Customer

Phone

Vehicle

Start Date

End Date

Total Amount

Status

Actions

Actions:

View

Edit

Delete

Include proper:

loading state

empty state

filtered-empty state

error state

pagination

9. New Rental

Route:

/rentals/new

Use:

POST /rentals

Fields:

Vehicle

Customer Name

Customer Phone

Start Date

End Date

Do NOT expose total_amount as an editable field.

The backend calculates it.

After a vehicle and valid dates are entered, the UI may show an estimated rental duration for convenience, but make it clear that the final amount comes from the server.

Important rule:

A rental where start date and end date are the same still counts as one rental day.

On submission, handle HTTP 409 Conflict prominently.

Conflict message example:

“This vehicle already has an active rental that overlaps the selected dates. Please choose another vehicle or date range.”

Do not try to bypass or replace backend overlap validation.

10. Rental Details

Route:

/rentals/:id

Use:

GET /rentals/:id

Show:

Customer

Name

Phone

Vehicle

Vehicle name

Plate number if API response provides it

Rental

Start date

End date

Total amount

Status

Actions:

Edit Rental

Delete Rental

Use a clean two-column detail layout on desktop and stacked layout on mobile.

11. Edit Rental

Route:

/rentals/:id/edit

Use:

PUT /rentals/:id

Allow updates to supported rental information.

Changing:

vehicle

start date

end date

must rely on the backend to perform overlap checking again.

Never trust or send an authoritative user-entered total amount.

If the backend returns 409, display the same booking-conflict UI used during creation.

12. Delete Rental

Use:

DELETE /rentals/:id

Unlike vehicle deletion, rental deletion is hard delete according to the backend requirements.

Use a stronger confirmation dialog:

“Delete this rental permanently?”

Buttons:

Cancel

Delete Rental

Use destructive styling only on the final confirmation action.

13. Reports Page

Route:

/reports

Use:

GET /reports/rentals?month=YYYY-MM

Optional:

GET /reports/rentals?month=YYYY-MM&vehicle_id={id}

Header:

Monthly Rental Report

Filters:

Month picker

Vehicle dropdown

Generate / Apply

Default to the current month.

Show summary cards:

Total Bookings

Total Rented Days

Total Revenue

Highest Revenue Vehicle

Then display a report table.

Columns:

Vehicle

Total Bookings

Days Rented

Revenue

Highlight the highest-revenue vehicle subtly.

Add one useful chart below the table:

Revenue by Vehicle

Use a simple bar chart.

Do not calculate month-boundary revenue independently if the API already supplies the correct monthly result.

The backend specifically handles rentals crossing month boundaries, so visualize the returned values directly.

Cancelled rentals must not appear as revenue-producing activity if excluded by the backend report.

API Architecture

Create a clean API layer such as:

src/
  api/
    client.ts
    auth.api.ts
    vehicles.api.ts
    rentals.api.ts
    reports.api.ts


Use an environment variable:

VITE_API_BASE_URL=


Create a reusable API client that:

prepends the API base URL

attaches the JWT

handles JSON responses

supports multipart/form-data

handles 401 globally

normalizes API errors where reasonable

Do not tightly couple API requests directly inside page components.

Suggested Frontend Structure

src/
  api/
  components/
    layout/
    common/
    vehicles/
    rentals/
    reports/

  pages/
    LoginPage.tsx
    DashboardPage.tsx

    vehicles/
      VehiclesPage.tsx
      VehicleDetailsPage.tsx
      VehicleFormPage.tsx

    rentals/
      RentalsPage.tsx
      RentalDetailsPage.tsx
      RentalFormPage.tsx

    reports/
      ReportsPage.tsx

  hooks/
  lib/
  types/
  routes/


Keep components feature-oriented and avoid unnecessary abstraction.

Shared Components

Build reusable components for:

AppSidebar

AppHeader

PageHeader

DataTable

SearchInput

FilterBar

StatusBadge

EmptyState

ErrorState

LoadingSkeleton

Pagination

ConfirmationDialog

ImageUpload

FormField

CurrencyDisplay

DateRangeDisplay

Only create abstractions when they genuinely improve readability.

UX Requirements

Every network-dependent screen must have:

loading state

success state

empty state where applicable

error state

Forms must have:

inline validation

disabled/loading submit state

backend error feedback

success feedback

Use toast notifications for actions such as:

Vehicle added

Vehicle updated

Vehicle removed

Rental created

Rental updated

Rental deleted

Do not use toast notifications as the only way to communicate important validation or booking conflicts.

Responsive Behaviour

Desktop should be the primary experience because this is an operations dashboard.

Still make it fully usable on:

tablet

mobile

On small screens:

sidebar becomes a drawer

tables may become responsive cards or horizontally scroll

forms stack vertically

page actions remain easily accessible

Important Business Rules

The UI must respect these backend rules:

Staff authentication is required for Vehicles, Rentals, and Reports.

Vehicle plate numbers are unique.

Vehicles are soft deleted.

Vehicle rental history must remain after vehicle removal.

Rental statuses are exactly:

booked

ongoing

completed

cancelled

Booked and ongoing rentals are active bookings.

Completed and cancelled rentals do not block new bookings.

Rental overlap detection is authoritative on the backend.

Conflicting rental creation/update may return HTTP 409.

Rental total amount is calculated by the backend.

Same-day rental counts as one day.

Monthly report calculations come from the backend.

Month-spanning rentals contribute only the appropriate days/revenue to the selected month.

Cancelled rentals do not contribute to monthly rental activity reporting.

Do NOT Add

Do not add:

Customer login

Customer dashboard

Public vehicle booking website

Checkout

Payment gateway

Online payments

Refresh tokens

Role/permission management

Notifications

Messaging

S3/cloud upload

Audit logs

Redis

Chat

Reviews

Coupons

Maps

Driver management

Maintenance management

Customer CRM

Invoices

Settings pages with invented functionality

Keep the interface tightly aligned with the existing backend.

Final Quality Bar

Make the frontend look like something a real vehicle-rental operations team could use.

It should demonstrate:

strong information architecture

polished forms

thoughtful API states

clean TypeScript structure

reusable components

sensible frontend architecture

excellent error handling

visual clarity

direct alignment with the backend requirements

Prioritize professional usability and technical-review clarity over flashy design.

Generate the complete frontend experience with mock data first, while structuring everything so replacing mock functions with the real REST API requires minimal changes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/691f5ba3-d58d-45d7-84c2-9e38b35f65b1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
