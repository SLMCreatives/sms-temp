import { AppSidebar } from "@/components/nav_components/app-sidebar";
import { UserProfile } from "@/components/new/user-profile";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { IntakeProvider } from "@/components/new/intake-context";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    // AppSidebar uses variant="inset", so the page sits on the sidebar colour
    // and the content floats above it as a rounded panel.
    <IntakeProvider>
      <SidebarProvider className="bg-sidebar">
        <AppSidebar />
        {/*
        min-w-0 lets the table scroll horizontally instead of stretching the
        flex row. No overflow-hidden here — it would make this a scrollport and
        stop the sticky header and record rail from sticking.
      */}
        <SidebarInset className="min-w-0">
          <Toaster position="top-right" richColors />

          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger className="-ml-1" />
            <span className="text-sm font-semibold tracking-tight">SST.MS</span>
            <span className="hidden text-xs text-muted-foreground md:inline">
              Student Success Team Management System
            </span>
            <div className="ml-auto">
              <UserProfile />
            </div>
          </header>

          <div className="min-w-0 flex-1 px-4 py-5 lg:px-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </IntakeProvider>
  );
}
