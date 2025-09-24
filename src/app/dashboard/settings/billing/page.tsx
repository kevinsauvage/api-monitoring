import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import BillingSettings from "@/components/features/settings/BillingSettings";
import { BillingService } from "@/lib/core/services";
import { authOptions } from "@/lib/infrastructure/auth";
import { registerAllServices } from "@/lib/infrastructure/di";

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Register services
  registerAllServices();

  const billingService = new BillingService();

  // Fetch billing data server-side
  const [billingData, billingHistory, paymentMethods] = await Promise.all([
    billingService.getBillingData(session.user.id),
    billingService.getBillingHistory(session.user.id, 10),
    billingService.getPaymentMethods(session.user.id),
  ]);

  return (
    <BillingSettings
      user={session.user}
      billingData={billingData}
      billingHistory={billingHistory}
      paymentMethods={paymentMethods}
    />
  );
}
