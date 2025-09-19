"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/shared/utils/utils";

interface ConnectionNavigationProps {
  connectionId: string;
}

export default function ConnectionNavigation({
  connectionId,
}: ConnectionNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: `/dashboard/connections/${connectionId}`,
    },
    {
      name: "Health Checks",
      href: `/dashboard/connections/${connectionId}/health-checks`,
    },
    {
      name: "History",
      href: `/dashboard/connections/${connectionId}/history`,
    },
  ];

  return (
    <nav className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
