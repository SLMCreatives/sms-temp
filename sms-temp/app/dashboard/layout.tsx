import { AppSidebar } from "@/components/nav_components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SidebarTrigger className=" sticky top-2 left-2 z-40 md:hidden " />
            <div className="flex flex-col gap-20 max-w-3xl lg:max-w-full mx-auto">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </main>
  );
}
