import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardRows } from "@/lib/dashboard-data";

// The figures move as the team works — never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await getDashboardRows();

  if (rows.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-20">
        <h1 className="text-2xl font-semibold tracking-tight">
          No students to show
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The dashboard query came back empty. That is usually a connection
          problem rather than an empty intake — try reloading the page.
        </p>
      </div>
    );
  }

  return <DashboardClient rows={rows} />;
}
