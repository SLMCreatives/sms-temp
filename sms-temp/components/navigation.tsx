import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "./ui/navigation-menu";
import {
  BookOpenText,
  Briefcase,
  ChartPie,
  Cpu,
  GraduationCap,
  LayoutDashboard,
  Mails
} from "lucide-react";
import Image from "next/image";

export function NavMenuAuth() {
  return (
    <div className="flex gap-2 items-center">
      <NavigationMenu viewport={false} className="z-50 w-full">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/student">
                <Image
                  src="/UIU_logo.png"
                  alt="logo"
                  width={300}
                  height={300}
                  className="w-8 h-8 object-contain"
                />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="flex flex-row gap-2 items-center">
                <GraduationCap className="h-5 w-5 flex" />
                <p className="hidden md:flex">Student List </p>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="max-w-[250px] w-full flex flex-row lg:flex-col gap-2">
              <NavigationMenuLink asChild>
                <Link href="/student/fob">
                  <p className="flex flex-row gap-4 items-center justify-start">
                    <Briefcase className="h-5 w-5" />
                    FOB
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  href="/student/feh"
                  className="flex flex-row justify-between w-full"
                >
                  <p className="flex flex-row gap-4 items-center justify-start">
                    <BookOpenText className="h-5 w-5" />
                    FEH
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  href="/student/faift"
                  className="flex flex-row flex-nowrap justify-between w-full"
                >
                  <p className="flex flex-row gap-4 items-center justify-start">
                    <Cpu className="h-5 w-5" />
                    FAiFT
                  </p>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="flex flex-row gap-2 items-center">
                <LayoutDashboard className="h-5 w-5" />
                <p className="hidden md:flex">Dashboard</p>{" "}
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col gap-2 w-full">
              <NavigationMenuLink asChild>
                <Link
                  href="/dashboard"
                  className="flex flex-row flex-nowrap justify-between w-full"
                >
                  <p className="flex flex-row gap-4 items-center justify-start">
                    <ChartPie className="h-5 w-5" /> Student Overview
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  href="/dashboard/engagements"
                  className="flex flex-row flex-nowrap justify-between w-full"
                >
                  <p className="flex flex-row gap-4 items-center justify-start">
                    <Mails className="h-5 w-5" />
                    Engagement
                  </p>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
