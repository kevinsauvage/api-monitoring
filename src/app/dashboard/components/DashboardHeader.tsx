"use client";

import { signOut } from "next-auth/react";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-muted-foreground hover:text-foreground relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
            >
              {user.image ? (
                <Image
                  className="h-8 w-8 rounded-full"
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 aspect-square bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 aspect-square text-primary-foreground" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {user.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border py-1 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to settings
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
