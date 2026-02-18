"use client";

import * as React from "react";
import { Bot, CircleUserRound, SquareTerminal } from "lucide-react";

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
import { TeamSwitcher } from "./team-switcher";

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
      title: "Intake",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Jan 26 Online",
          url: "/student/2026/jan/online"
        },
        {
          title: "Jan 26 Conventional",
          url: "/student/2026/jan/conventional"
        },
        {
          title: "Nov 25 Online",
          url: "/student/2025/nov/online"
        }
      ]
    },
    {
      title: "Team Tasks",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Amirul",
          url: "/amirul"
        },
        {
          title: "Farzana",
          url: "/farzana"
        },
        {
          title: "Ayu",
          url: "/ayu"
        },
        { title: "Najwa", url: "/najwa" }
      ]
    }
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
        <TeamSwitcher teams={data.teams} />
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
