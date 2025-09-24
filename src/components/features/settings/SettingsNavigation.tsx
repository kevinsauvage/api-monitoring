"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  User,
  Bell,
  Shield,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    description: "Manage your personal information",
    icon: User,
    href: "/dashboard/settings",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure alert preferences",
    icon: Bell,
    href: "/dashboard/settings/notifications",
  },
  {
    id: "security",
    title: "Security",
    description: "Password and authentication settings",
    icon: Shield,
    href: "/dashboard/settings/security",
  },
  {
    id: "billing",
    title: "Billing",
    description: "Manage your subscription and payments",
    icon: CreditCard,
    href: "/dashboard/settings/billing",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Appearance and general settings",
    icon: SettingsIcon,
    href: "/dashboard/settings/preferences",
  },
];

export default function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = pathname === section.href;

            return (
              <Link
                key={section.id}
                href={section.href}
                className={`block w-full p-3 rounded-md transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center w-full">
                  <Icon
                    className={`h-4 w-4 mr-3 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <div
                      className={`text-sm font-medium ${
                        isActive ? "text-primary" : ""
                      }`}
                    >
                      {section.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}

