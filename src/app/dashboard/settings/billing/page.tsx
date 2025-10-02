import { getServerSession } from "next-auth";

import BillingSettings from "@/components/features/settings/BillingSettings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getBillingService } from "@/lib/infrastructure/di";

import type { Session } from "next-auth";

export default async function BillingSettingsPage() {
  const session = (await getServerSession(authOptions)) as Session;

  const billingService = getBillingService();

  const user = session.user;
  const userId = user.id;

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
}
