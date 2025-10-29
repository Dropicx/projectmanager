"use client";

import {
  type FroxDropdownAction,
  FroxHeader,
  type FroxNotificationProps,
} from "@consulting-platform/ui";
import {
  Bell,
  BookOpen,
  FileText,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "@/contexts/sidebar-context";

const UserButton = dynamic(() => import("@clerk/nextjs").then((mod) => mod.UserButton), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />,
});

export function FroxDashboardHeader() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { setIsMobileOpen } = useSidebar();

  // Notification icons configuration
  const notifications: FroxNotificationProps[] = [
    {
      icon: MessageSquare,
      count: 3,
      color: "fuchsia",
      onClick: () => console.log("Messages clicked"),
    },
    {
      icon: Bell,
      count: 5,
      color: "red",
      onClick: () => console.log("Notifications clicked"),
    },
    {
      icon: Mail,
      count: 0,
      color: "blue",
      onClick: () => console.log("Mail clicked"),
    },
  ];

  // Browse dropdown actions
  const browseActions: FroxDropdownAction[] = [
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: BookOpen,
      onClick: () => router.push("/knowledge"),
    },
    {
      id: "projects",
      label: "Projects",
      icon: FileText,
      onClick: () => router.push("/projects"),
    },
  ];

  // Profile dropdown actions
  const profileActions: FroxDropdownAction[] = [
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      onClick: () => router.push("/settings/profile"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => router.push("/settings"),
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      onClick: () => {
        // Clerk handles logout
        window.location.href = "/";
      },
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // TODO: Implement search functionality
    console.log("Searching for:", value);
  };

  return (
    <FroxHeader
      searchPlaceholder="Search projects, knowledge..."
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      showSearch={true}
      showBrowse={true}
      browseActions={browseActions}
      notifications={notifications}
      profileActions={profileActions}
      onMobileMenuToggle={() => setIsMobileOpen(true)}
      profileAvatar={
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
              userButtonTrigger: "focus:outline-none",
              userButtonAvatarBox: "w-10 h-10",
            },
          }}
          showName={false}
          afterSignOutUrl="/"
        />
      }
    />
  );
}
