export const API_PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing API",
    icon: "💳",
    baseUrl: "https://api.stripe.com",
    authType: "bearer",
    fields: [
      {
        name: "apiKey",
        label: "Publishable Key",
        type: "password",
        required: true,
      },
      {
        name: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Communication platform",
    icon: "📱",
    baseUrl: "https://api.twilio.com",
    authType: "basic",
    fields: [
      {
        name: "accountSid",
        label: "Account SID",
        type: "text",
        required: true,
      },
      {
        name: "authToken",
        label: "Auth Token",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery service",
    icon: "📧",
    baseUrl: "https://api.sendgrid.com",
    authType: "bearer",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository platform",
    icon: "🐙",
    baseUrl: "https://api.github.com",
    authType: "bearer",
    fields: [
      {
        name: "token",
        label: "Personal Access Token",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication",
    icon: "💬",
    baseUrl: "https://slack.com/api",
    authType: "bearer",
    fields: [
      { name: "token", label: "Bot Token", type: "password", required: true },
    ],
  },
  {
    id: "custom",
    name: "Custom API",
    description: "Your own API endpoint",
    icon: "🔗",
    baseUrl: "",
    authType: "bearer",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true },
    ],
  },
];
