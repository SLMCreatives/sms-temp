import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "./ui/navigation-menu";
import { Briefcase } from "lucide-react";

export function NavMenuAuth() {
  return (
    <div className="flex gap-2 items-center">
      <Link href={"/student"}>SMS</Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Faculty</NavigationMenuTrigger>
            <NavigationMenuContent className="w-full">
              <NavigationMenuLink asChild>
                <Link
                  href="/student/fob"
                  className="flex flex-row justify-between"
                >
                  Faculty of Business
                  <Briefcase className="h-5 w-5" />
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  href="/student/feh"
                  className="flex flex-row justify-between"
                >
                  Faculty of Education & Humanities
                  <Briefcase className="h-5 w-5" />
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link href="/student/sit">
                  School of Information Technology
                </Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
            <NavigationMenuContent className="w-fit">
              <NavigationMenuLink asChild>
                <Link href="/dashboard">Student Overview</Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link href="/dashboard/engagements">Engagement</Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
