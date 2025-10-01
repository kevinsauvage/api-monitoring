# API Pulse - Unified API Monitoring Platform

API Pulse is a platform for monitoring, tracking, and optimizing APIs across providers. It provides real-time health checks, configurable schedules, and alerting.

## Features

- **Unified Dashboard**: Monitor all your APIs in one place
- **Health Checks**: Scheduled checks with timeouts and concurrency controls
- **Alerts**: Notify via Slack, email, or webhook
- **Encryption**: Secure storage for secrets
- **Developer UX**: Strong typing, linting, tests and coverage

## Tech Stack

- **Runtime**: Node.js 18+
- **Web**: Next.js 15.5, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **API/Server**: Next.js Route Handlers
- **ORM**: Prisma 5
- **DB**: PostgreSQL
- **Auth**: NextAuth.js (+ Prisma adapter)
- **UI**: Radix UI, Lucide React
- **Charts**: Recharts
- **Testing**: Vitest (+ @testing-library)
- **Linting**: ESLint 9

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm

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

3. **Configure environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` (see `env.example` for all options):

   ```env
   # Database
   PRISMA_DATABASE_URL="postgresql://username:password@localhost:5432/api_pulse?schema=public"

   # NextAuth.js
   NEXTAUTH_URL=
   NEXTAUTH_SECRET=

   # Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""

   # Email
   SMTP_HOST=""
   SMTP_PORT=""
   SMTP_USER=""
   SMTP_PASSWORD=""
   FROM_EMAIL=""

   # Slack
   SLACK_BOT_TOKEN=""
   SLACK_SIGNING_SECRET=""

   # Encryption
   ENCRYPTION_KEY=

   # Monitoring
   DEFAULT_CHECK_INTERVAL=300
   DEFAULT_TIMEOUT=5000
   MAX_CONCURRENT_CHECKS=10

   # Logging
   LOG_LEVEL=info
   ```

4. **Database setup**

   If you are developing locally and want to apply pending migrations and create a new one if needed:

   ```bash
   npx prisma migrate dev
   ```

   If you only need to generate the client and apply existing migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Start the app (development)**

   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit http://localhost:3000

## Scripts

```bash
# Development
npm run dev

# Build & start
npm run build
npm start

# Linting & types
npm run lint
npm run lint:fix
npm run type-check
npm run check-all

# Tests
npm run test        # interactive
npm run test:run    # CI
npm run test:watch  # watch mode
npm run test:coverage
npm run test:ui     # open Vitest UI
```

## Project Structure

```
src/
├── app/                         # Next.js app router (routes, pages, API handlers)
│   └── api/                     # Route handlers (e.g. auth, cron)
├── components/                  # UI components (features + shared)
├── lib/
│   ├── core/                    # Domain core: services, repositories, types, utils
│   ├── infrastructure/          # Auth, database, DI, encryption, etc.
│   └── shared/                  # Shared constants, errors, helpers
└── test/                        # Test setup, mocks, utilities

prisma/
└── schema.prisma                # Prisma schema and migrations
```

Notable files:

- `src/lib/infrastructure/auth/auth.ts` – NextAuth config and helpers
- `src/lib/infrastructure/database/db.ts` – Prisma client
- `src/lib/infrastructure/encryption/encryption.ts` – crypto helpers
- `src/app/api/cron/health-checks/route.ts` – cron endpoint for health checks

## Database: common commands

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations in dev
npx prisma migrate dev

# Apply migrations in prod/CI
npx prisma migrate deploy

# Prisma Studio
npx prisma studio
```

## Cron jobs

See `CRON_JOBS.md` for the available scheduled tasks and how to trigger them.

## Building for production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (with tests when applicable)
4. Run linting and tests locally
5. Open a pull request

## License

MIT

## Development Basic Auth

To gate the app in non-production, set in `.env` and restart dev server:

```env
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USERNAME=your-user
BASIC_AUTH_PASSWORD=your-pass
```
