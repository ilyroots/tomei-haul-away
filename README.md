# Tomei Haul Away

A customer-facing website and admin dashboard for a junk-removal and hauling business. Built with Next.js, React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Tech stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, React Server Components)
- **UI**: React 19, Tailwind CSS 3, custom form + layout components
- **Forms**: react-hook-form + Zod
- **Auth**: NextAuth.js v5 (credentials provider for admin users)
- **Database**: PostgreSQL via Prisma ORM
- **Email**: Resend
- **Object storage**: S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, etc.)
- **Security**: Cloudflare Turnstile (optional), honeypot field, rate limiting, submission tokens
- **Testing**: Vitest (unit), Playwright (E2E)

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local install, Docker, or hosted)
- npm (ships with Node)
- Optional: Docker and Docker Compose for a local database

## Local setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd tomei-haul-away
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and fill in real values:

   ```bash
   cp .env.example .env
   ```

4. Set `DATABASE_URL` in `.env` to point to your local PostgreSQL database, for example:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/tomei_haul_away?schema=public"
   ```

5. Generate the Prisma client and run migrations:

   ```bash
   npm run db:generate
   npm run migrate
   ```

6. Seed the database with safe example content (services, service-area ZIPs, FAQs):

   ```bash
   npm run seed
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000).

## Creating the first admin

Admin accounts are stored in the `Admin` table and authenticated with bcrypt-hashed passwords. Use the included CLI script to create the first admin:

```bash
npx tsx scripts/create-admin.ts
```

The script prompts for email, password, and name, then inserts the record via Prisma.

### One-off creation with environment variables

For automation or Railway deployment, you can pass values as environment variables:

```bash
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='a-long-random-password' ADMIN_NAME='Owner' npx tsx scripts/create-admin.ts
```

## Environment variables

| Variable                         | Required | Description                                                                                                     |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | Yes      | PostgreSQL connection string.                                                                                   |
| `AUTH_SECRET`                    | Yes      | Long random string for NextAuth.js encryption. Generate with `openssl rand -base64 32`.                         |
| `APP_URL`                        | Yes      | Public URL of the app, e.g. `http://localhost:3000` or `https://tomeihaulaway.com`.                             |
| `BUSINESS_TIMEZONE`              | Yes      | IANA timezone used for scheduling, e.g. `America/New_York`.                                                     |
| `ADMIN_EMAIL`                    | No       | Default admin email used by some health-check / seed flows. Prefer `scripts/create-admin.ts` for real accounts. |
| `RESEND_API_KEY`                 | Yes*     | Resend API key for transactional email. Required once email is enabled in production.                           |
| `RESEND_FROM_EMAIL`              | Yes*     | Verified sender address and display name, e.g. `Tomei Haul Away <hello@tomeihaulaway.com>`.                     |
| `BUSINESS_NOTIFICATION_EMAIL`    | Yes*     | Address that receives internal new-lead notifications.                                                          |
| `S3_ENDPOINT`                    | Yes*     | S3-compatible endpoint, e.g. `https://s3.us-east-1.amazonaws.com`.                                              |
| `S3_REGION`                      | Yes*     | S3 region, e.g. `us-east-1`.                                                                                    |
| `S3_BUCKET`                      | Yes*     | Bucket name for uploads.                                                                                        |
| `S3_ACCESS_KEY_ID`               | Yes*     | S3 access key.                                                                                                  |
| `S3_SECRET_ACCESS_KEY`           | Yes*     | S3 secret key.                                                                                                  |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No       | Cloudflare Turnstile site key. If omitted, the captcha widget is hidden.                                        |
| `TURNSTILE_SECRET_KEY`           | No       | Cloudflare Turnstile secret key. In non-production, empty/omitted = verification is bypassed.                   |

\* Required for production; local development can run without email/S3 if you disable those features, but quote/schedule photo uploads and email notifications will fail.

## Build, test, and lint

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# Unit tests
npm test

# E2E tests (requires DATABASE_URL and a running dev server; Playwright starts one automatically)
npm run test:e2e
```

## Running E2E tests

Playwright is configured to start the Next.js dev server automatically. E2E tests need a real PostgreSQL database because the quote/schedule forms write leads and the admin test logs in against the `Admin` table.

1. Make sure `DATABASE_URL` is set in `.env`.
2. The global setup script (`e2e/global-setup.ts`) seeds a test admin automatically. It is removed after the run by `e2e/global-teardown.ts`.
3. Run the suite:

   ```bash
   npm run test:e2e
   ```

4. To run a single test file:

   ```bash
   npx playwright test e2e/quote.spec.ts
   ```

### Skipping Turnstile in tests

`playwright.config.ts` unsets `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, so forms do not render the captcha and the server skips verification in non-production environments.

## Railway deployment

1. Push the repository to GitHub.
2. In Railway, create a new project and choose **Deploy from GitHub repo**.
3. Add a **PostgreSQL** service to the project.
4. Add an **S3-compatible storage bucket** (Railway Volume or an external provider such as AWS S3 / Cloudflare R2).
5. Add the required environment variables from the table above:
   - Copy values from Railway's PostgreSQL service for `DATABASE_URL`.
   - Set `AUTH_SECRET` to a strong random string.
   - Set `APP_URL` to the Railway-generated domain (or your custom domain).
   - Add Resend, S3, and Turnstile credentials.
6. Set the **pre-deploy migration command**:

   ```bash
   npm run migrate:deploy
   ```

7. Generate a public domain in Railway and point your custom domain DNS records at it if desired.
8. Configure the health check endpoint to `/api/health`.
9. After the first deploy, create the first admin:

   ```bash
   railway run -- npx tsx scripts/create-admin.ts
   ```

   or open a Railway shell and run:

   ```bash
   npx tsx scripts/create-admin.ts
   ```

10. Verify Resend sender-domain DNS records and send a test email.

## Uploading photos and S3 privacy

- Customer-uploaded photos are stored as private objects in the configured S3 bucket.
- The app generates short-lived presigned URLs for admin review; objects are not publicly readable by default.
- Uploaded assets are linked to the owning `Lead` or `Appointment` record and marked `isPrivate: true`.
- Make sure the bucket policy / IAM permissions allow `PutObject`, `GetObject`, and `DeleteObject` for the app credentials.

## Turnstile and honeypot configuration

- **Turnstile**: Optional. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client) and `TURNSTILE_SECRET_KEY` (server). Use Cloudflare's test keys (`1x00000000000000000000AA` and `1x0000000000000000000000000000000000000000000`) for local testing.
- **Honeypot**: Both public forms include a hidden `website` field. If a bot fills it, the submission is rejected silently. No configuration required.

## Project conventions

- Server actions live next to the pages that use them (`src/app/(public)/quote/actions.ts`, etc.).
- Shared UI components are in `src/components/ui/`.
- Business constants (services, service area, contact info) are in `src/lib/business/config.ts`.
- Database schema and migrations are in `prisma/`.
