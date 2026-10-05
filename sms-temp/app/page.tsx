import Link from "next/link";

import { SemesterOverview } from "@/components/home/semester-overview";
import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";
import { getHomeStats } from "@/lib/home-stats";
import { createClient } from "@/lib/supabase/server";

// Figures move as the team works, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  // The intake numbers are only fetched for a signed-in viewer. This page is
  // reachable without a session (the middleware lets "/" through), and the
  // figures describe real students.
  const stats = signedIn ? await getHomeStats() : null;

  return (
    <main className="flex min-h-svh flex-col">
      <SiteHeader signedIn={signedIn} intakeLabel={stats?.intakeLabel} />

      <div className="flex-1">
        {stats ? (
          <SemesterOverview stats={stats} />
        ) : signedIn ? (
          <EmptyState />
        ) : (
          <SignedOut />
        )}
      </div>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground">
          <p>Powered by UNITAR Marketing Team ❤️</p>
        </div>
      </footer>
    </main>
  );
}

/** Nothing about the current students until there is a session. */
function SignedOut() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-5 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        UNITAR · Student Success Team
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Keep every student moving from offer to first login.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        SST.MS tracks outreach, onboarding and CN activity for the current
        intake, so the team can see who still needs a call. Sign in to view this
        semester&apos;s figures.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/sign-up">Create an account</Link>
        </Button>
      </div>
    </div>
  );
}

/** Signed in, but the intake returned nothing — say so instead of showing zeros. */
function EmptyState() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">
        No figures to show yet
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load students for the current intake. This is usually a
        connection problem rather than an empty semester — try again, or open
        the student list directly.
      </p>
      <Button asChild className="mt-6" size="sm">
        <Link href="/student">Open student list</Link>
      </Button>
    </div>
  );
}
