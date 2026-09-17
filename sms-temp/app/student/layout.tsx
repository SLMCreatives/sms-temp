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
          flex row.
          From xl up the shell is exactly one viewport tall and never scrolls,
          so the table card keeps its header and horizontal scrollbar on screen.
          The inset variant adds m-2 (1rem of vertical margin), hence the calc.
        */}
        <SidebarInset className="min-w-0 xl:h-[calc(100svh-1rem)] xl:overflow-hidden">
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

          <div className="flex min-w-0 flex-1 flex-col px-4 py-3 lg:px-5 xl:min-h-0 xl:overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </IntakeProvider>
  );
}
