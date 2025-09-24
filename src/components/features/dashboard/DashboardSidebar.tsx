"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Zap,
  BarChart3,
  Plus,
  Settings,
  Bell,
  CreditCard,
  Shield,
  Activity,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "API Connections", href: "/dashboard/connections", icon: Plus },
  { name: "Health Checks", href: "/dashboard/health", icon: Activity },
  { name: "Cost Analytics", href: "/dashboard/cost", icon: CreditCard },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Security", href: "/dashboard/security", icon: Shield },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const NavigationContent = () => (
    <>
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="ml-2 text-xl font-bold text-sidebar-foreground">
          API Pulse
        </span>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                } mr-3 h-5 w-5`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-sidebar">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <NavigationContent />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-sidebar border-r border-sidebar-border">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <NavigationContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
