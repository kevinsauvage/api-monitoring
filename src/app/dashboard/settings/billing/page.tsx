import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import BillingSettings from "@/components/features/settings/BillingSettings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getBillingService } from "@/lib/infrastructure/di";

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const billingService = getBillingService();

  const user = session.user;
  const userId = user.id;

  try {
    const [billingData, billingHistory, paymentMethods] = await Promise.all([
      billingService.getBillingData(userId),
      billingService.getBillingHistory(userId, 10),
      billingService.getPaymentMethods(userId),
    ]);

    if (!billingData) {
      throw new Error("Failed to load billing data");
    }

    return (
      <BillingSettings
        user={user}
        billingData={billingData}
        billingHistory={billingHistory}
        paymentMethods={paymentMethods}
      />
    );
  } catch (error) {
    console.error("Error loading billing data:", error);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load billing data</p>
        </div>
      </div>
    );
  }
}
