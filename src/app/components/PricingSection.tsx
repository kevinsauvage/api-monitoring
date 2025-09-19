import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Hobby",
      price: "$0",
      description: "Perfect for side projects",
      features: [
        "3 API connections",
        "5-minute monitoring intervals",
        "7-day data retention",
        "Email alerts only",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      popular: false,
    },
    {
      name: "Startup",
      price: "$49",
      description: "For growing teams",
      features: [
        "15 API connections",
        "1-minute monitoring intervals",
        "30-day data retention",
        "Slack + email alerts",
        "Cost analytics",
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
      popular: true,
    },
    {
      name: "Business",
      price: "$199",
      description: "For enterprise teams",
      features: [
        "Unlimited API connections",
        "Real-time monitoring",
        "90-day data retention",
        "All alert channels",
        "Team collaboration",
      ],
      buttonText: "Contact Sales",
      buttonStyle:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      popular: false,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your team size and monitoring needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl border ${
                plan.popular ? "border-2 border-primary" : "border-border"
              } bg-card relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-card-foreground mb-2">
                  {plan.price}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-chart-2 mr-3" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={`w-full ${plan.buttonStyle} py-3 rounded-lg font-semibold text-center block transition-colors`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
