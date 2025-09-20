import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            <Card
              key={index}
              className={`relative ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-bold mb-2">{plan.price}</div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-chart-2 mr-3" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  <Link href="/auth/signup">{plan.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
