# API Pulse - Unified API Monitoring Platform

API Pulse is a comprehensive platform for monitoring, tracking, and optimizing APIs across multiple providers. Get real-time health checks, cost monitoring, and intelligent alerts for all your API integrations.

## Features

- **Unified Dashboard**: Monitor all your APIs in one place
- **Health Checks**: Automated monitoring with customizable intervals
- **Cost Tracking**: Monitor spending across API providers
- **Smart Alerts**: Get notified via Slack, email, or webhook
- **Rate Limit Monitoring**: Track usage to prevent throttling
- **Secure Key Vault**: Encrypted storage with audit logs
- **Multi-tier Subscriptions**: Hobby, Startup, and Business plans

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide React
- **Charts**: Recharts
- **Encryption**: Node.js crypto module

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd api-monitoring
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/api_pulse?schema=public"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""

   # Email Configuration
   SMTP_HOST=""
   SMTP_PORT=""
   SMTP_USER=""
   SMTP_PASSWORD=""
   FROM_EMAIL=""

   # Slack Integration
   SLACK_BOT_TOKEN=""
   SLACK_SIGNING_SECRET=""

   # Encryption
   ENCRYPTION_KEY="your-32-character-encryption-key"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── encryption.ts     # Encryption utilities
└── prisma/               # Database schema
    └── schema.prisma     # Prisma schema
```

## Subscription Tiers

### Hobby (Free)

- 3 API connections
- 5-minute monitoring intervals
- 7-day data retention
- Email alerts only

### Startup ($49/month)

- 15 API connections
- 1-minute monitoring intervals
- 30-day data retention
- Slack + email alerts
- Cost analytics

### Business ($199/month)

- Unlimited API connections
- Real-time monitoring
- 90-day data retention
- All alert channels
- Team collaboration

## Development

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@apipulse.com or join our Discord community.
