import Link from "next/link";

import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
          Monitor All Your APIs
          <span className="block text-primary">In One Place</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Track health, and get intelligent alerts for all your API
          integrations. From Stripe to Twilio, keep everything running smoothly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="#demo"
            className="border border-border text-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
          >
            View Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
