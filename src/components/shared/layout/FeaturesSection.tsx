import {
  CheckCircle,
  Zap,
  Shield,
  DollarSign,
  BarChart3,
  Bell,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      iconColor: "text-chart-1",
      iconBg: "bg-chart-1/20",
      title: "Unified Dashboard",
      description:
        "See status, response times, and error rates for all your APIs in a single, beautiful interface.",
    },
    {
      icon: DollarSign,
      iconColor: "text-chart-2",
      iconBg: "bg-chart-2/20",
      title: "Cost Monitoring",
      description:
        "Track spending across all API providers and get alerts when costs spike unexpectedly.",
    },
    {
      icon: Bell,
      iconColor: "text-chart-4",
      iconBg: "bg-chart-4/20",
      title: "Smart Alerts",
      description:
        "Get notified via Slack, email, or webhook when issues arise or thresholds are exceeded.",
    },
    {
      icon: Zap,
      iconColor: "text-chart-3",
      iconBg: "bg-chart-3/20",
      title: "Rate Limit Tracking",
      description:
        "Monitor rate limit usage across all APIs to prevent throttling during peak traffic.",
    },
    {
      icon: Shield,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/20",
      title: "Secure Key Vault",
      description:
        "Store API keys encrypted with audit logs and role-based access control.",
    },
    {
      icon: CheckCircle,
      iconColor: "text-chart-5",
      iconBg: "bg-chart-5/20",
      title: "Health Checks",
      description:
        "Automated health checks with customizable intervals and failure detection.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Monitor APIs
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive monitoring tools designed for modern development teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
