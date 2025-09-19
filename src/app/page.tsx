import Navigation from "@/components/shared/layout/Navigation";
import HeroSection from "@/components/shared/layout/HeroSection";
import FeaturesSection from "@/components/shared/layout/FeaturesSection";
import PricingSection from "@/components/shared/layout/PricingSection";
import Footer from "@/components/shared/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
