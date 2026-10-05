import Image from "next/image";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

/**
 * The home page app bar.
 *
 * Flat links rather than the dropdown menu this page used to carry: there are
 * only three daily destinations, and the sidebar already owns deep navigation
 * once you are inside a section. A dropdown to reach three places costs a click
 * and hides the structure.
 *
 * Signed-out visitors get no section links — none of those routes would render
 * for them anyway, and the middleware would bounce them to the login page.
 */

const SECTIONS = [
  { href: "/student", label: "Students" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/engagement", label: "Engagement" }
];

export function SiteHeader({
  signedIn,
  intakeLabel
}: {
  signedIn: boolean;
  intakeLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5 sm:gap-6">
        <Link
          href={signedIn ? "/student" : "/"}
          className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/UIU_logo.png"
            alt=""
            width={128}
            height={128}
            className="h-7 w-7 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">SST.MS</span>
            <span className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
              Student Success Team
            </span>
          </span>
        </Link>

        {signedIn && (
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="shrink-0 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {signedIn && intakeLabel && (
            <span className="hidden rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground md:inline-block">
              {intakeLabel} intake
            </span>
          )}
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
