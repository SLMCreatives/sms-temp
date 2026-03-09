"use client";

import * as React from "react";
import { CircleUserRound, Menu } from "lucide-react";

//import { NavUser } from "@/components/nav_components/nav-user";
//import { TeamSwitcher } from "@/components/nav_components/team-switcher";
import { NavMain } from "@/components/nav_components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  teams: [
    {
      name: "Amirul",
      logo: CircleUserRound,
      plan: "Sr. Executive"
    },
    {
      name: "Farzana",
      logo: CircleUserRound,
      plan: "GA"
    },
    {
      name: "Ayu",
      logo: CircleUserRound,
      plan: "Executive"
    },
    {
      name: "Najwa",
      logo: CircleUserRound,
      plan: "Executive"
    }
  ],
  navMain: [
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      items: [
        {
          title: "Student List",
          url: "/student"
        },
        {
          title: "Dashboard",
          url: "/dashboard"
        },
        {
          title: "Admin",
          url: "/admin"
        }
      ]
    }
    /* {
      title: "Dashboard",
      url: "/dashboard",
      icon: Bot,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard"
        },
        {
          title: "November 2025",
          url: "/dashboard/c325"
        },
        {
          title: "January 2026",
          url: "/dashboard/c126"
        },
        {
          title: "Ayu",
          url: "/ayu"
        },
        { title: "Najwa", url: "/najwa" }
      ]
    } */
    /* {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#"
        },
        {
          title: "Get Started",
          url: "#"
        },
        {
          title: "Tutorials",
          url: "#"
        },
        {
          title: "Changelog",
          url: "#"
        }
      ]
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#"
        },
        {
          title: "Team",
          url: "#"
        },
        {
          title: "Billing",
          url: "#"
        },
        {
          title: "Limits",
          url: "#"
        }
      ]
    } */
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      {...props}
      className="min-w-[200px]"
    >
      <SidebarHeader>
        {" "}
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*  <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>{/*  <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
