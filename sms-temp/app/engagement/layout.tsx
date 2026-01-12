import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-2 items-center font-semibold">
              <Link href={"/student"}>SMS</Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Faculty</NavigationMenuTrigger>
                    <NavigationMenuContent className="w-fit">
                      <div className="flex flex-row gap-2 p-2">
                        <NavigationMenuLink asChild>
                          <Link href="/student/fob">FOB</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="/student/feh">FEH</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="/student/faift">FAiFT</Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <AuthButton />
          </div>
        </nav>
        <div className="flex flex-col gap-20 min-w-5xl">{children}</div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>Powered by UNITAR Marketing Team ❤️</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
