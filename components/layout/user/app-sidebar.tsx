"use client"

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  FileUserIcon,
  Frame,
  GalleryVerticalEnd,
  Map,
  Newspaper,
  PieChart,
  ScanSearch,
  User2Icon
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/layout/user/nav-main"
import { NavProjects } from "@/components/layout/user/nav-projects"
import { NavUser } from "@/components/layout/user/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "You",
    email: "@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Exercises",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Sleep Tracker",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Health Tools",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: User2Icon,
      isActive: true,
      items: [
        {
          title: "Exercises",
          url: "/tools/exercises",
        },
        {
          title: "Sleep Tracker",
          url: "/sleep-tracker",
        },
        {
          title: "Health Tools",
          url: "/tools",
        },
      ],
    },
    {
      title: "Symptom Search",
      url: "/tools/symptom-search",
      icon: Bot,
    },
    {
      title: "Medicine Finder",
      url: "/tools/medicine-search",
      icon: BookOpen,
    },
    {
      title: "Disease Glossary",
      url: "/diseases",
      icon: ScanSearch,
    },
    {
      title: "Personalized AI",
      url: "/ai",
      icon: FileUserIcon,
    },
    {
      title: "Smart Watch Dashboard",
      url: "/watch",
      icon: Newspaper
    }
  ],
  projects: [
    {
      name: "Web Map",
      url: "/web-map",
      icon: Frame,
    },
    {
      name: "Statistics",
      url: "/stats",
      icon: PieChart,
    },
    {
      name: "Glossary & FAQs",
      url: "/glossary",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
