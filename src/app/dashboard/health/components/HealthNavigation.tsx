"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, BarChart3 } from "lucide-react";

const navigation = [
  {
    name: "Recent Activity",
    href: "/dashboard/health",
    icon: Activity,
  },
  {
    name: "Failures",
    href: "/dashboard/health/failures",
    icon: AlertTriangle,
  },
  {
    name: "Performance",
    href: "/dashboard/health/performance",
    icon: BarChart3,
  },
];

export default function HealthNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
