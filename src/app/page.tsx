import { getServerSession } from "next-auth";

import FeaturesSection from "@/components/shared/layout/FeaturesSection";
import Footer from "@/components/shared/layout/Footer";
import HeroSection from "@/components/shared/layout/HeroSection";
import Navigation from "@/components/shared/layout/Navigation";
import PricingSection from "@/components/shared/layout/PricingSection";

export default async function Home() {
  const session = await getServerSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Navigation session={session} />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
