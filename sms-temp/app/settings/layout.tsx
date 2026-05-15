import { AppSidebar } from "@/components/nav_components/app-sidebar";
import { UserProfile } from "@/components/new/user-profile";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function SettingsLayout({
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
            <div className="flex flex-col gap-20 max-w-3xl lg:max-w-full lg:w-[100vw] lg:px-32 mx-auto lg:pl-[250px] dark:bg-black">
              <Toaster position="top-right" richColors />
              <div className="fixed top-4 right-4">
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
