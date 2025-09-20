"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/shared/utils/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-1 bg-muted/30 w-fit">
      <nav className="flex space-x-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/70 text-foreground shadow-sm"
                  : "hover:bg-background/70 text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </Card>
  );
}
