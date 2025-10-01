import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import DashboardHeader from "@/components/features/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/features/dashboard/DashboardSidebar";
import { authOptions } from "@/lib/infrastructure/auth";
import { getDashboardService } from "@/lib/infrastructure/di";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const dashboardService = getDashboardService();
  const user = await dashboardService.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <DashboardSidebar />
      <div className="w-full">
        <DashboardHeader user={user} />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
