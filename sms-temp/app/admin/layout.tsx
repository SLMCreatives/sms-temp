import { AppSidebar } from "@/components/nav_components/app-sidebar";
import { UserProfile } from "@/components/new/user-profile";
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
            {/* w-full, never 100vw: this sits inside SidebarInset, which is
                already narrowed by the sidebar, so a viewport-width child
                overflows by exactly the sidebar's width. */}
            <div className="flex w-full min-w-0 flex-col max-w-3xl lg:max-w-full lg:px-32 mx-auto dark:bg-black">
              <div className="fixed top-4 right-4 z-30">
                <UserProfile />
              </div>
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </main>
  );
}
