# Launch Checklist

This list covers real business details, content, photos, policies, and credentials that must be supplied before the site goes live. Code tasks are complete.

## Business identity and contact info

- [ ] Replace `HOME_CITY` in `src/lib/business/config.ts` with the actual home-base city.
- [ ] Replace `PHONE` with the real business phone number.
- [ ] Replace `TEXT_NUMBER` with the real SMS number (may be the same as `PHONE`).
- [ ] Replace `EMAIL` with the real customer-facing email address.
- [ ] Replace `BUSINESS_HOURS` with actual operating hours.
- [ ] Replace `OWNER_NAME` with the owner's name.
- [ ] Update `COMPANY_NAME` if the legal DBA differs from "Tomei Haul Away".

## Service area

- [ ] Replace service-area cities in `src/lib/business/config.ts` with actual covered cities/towns.
- [ ] Replace service-area ZIP codes with the actual ZIP codes you serve.
- [ ] Verify `radiusMiles` matches the real service radius.

## Photos and media

- [ ] Upload real truck photos and replace any placeholder gallery images.
- [ ] Upload real team photos.
- [ ] Upload real job-site / before-and-after photos.
- [ ] Mark any remaining placeholder gallery items as drafts or remove them before launch.
- [ ] Optimize images for web (compress, use appropriate dimensions).

## Customer content

- [ ] Add real customer testimonials via the admin dashboard.
- [ ] Approve testimonials so they appear on the site.
- [ ] Do not seed fake testimonials or reviews in production.

## Legal pages

- [ ] Replace placeholder privacy policy text with an attorney-reviewed privacy policy.
- [ ] Replace placeholder terms of service text with an attorney-reviewed terms document.
- [ ] Add any required disclaimers or state-specific hauling/disposal disclosures.

## Email

- [ ] Configure Resend sender domain and verify DNS records (SPF, DKIM, DMARC).
- [ ] Set `RESEND_FROM_EMAIL` to a verified sender address.
- [ ] Set `BUSINESS_NOTIFICATION_EMAIL` to the address that should receive new-lead alerts.
- [ ] Send test emails from the admin email preview if available.

## Database and hosting

- [ ] Provision Railway PostgreSQL (or other hosted PostgreSQL).
- [ ] Provision an S3-compatible storage bucket for uploads.
- [ ] Configure bucket CORS and IAM permissions (PutObject, GetObject, DeleteObject).
- [ ] Set all production environment variables in Railway.
- [ ] Set the Railway pre-deploy command to `npm run migrate:deploy`.
- [ ] Configure Railway health check to `/api/health`.
- [ ] Generate a public domain in Railway and configure DNS / custom domain.

## Security

- [ ] Set a strong `AUTH_SECRET` in production.
- [ ] Configure Cloudflare Turnstile keys (optional but recommended for production).
- [ ] Confirm honeypot field is present and working on both public forms.

## Admin access

- [ ] Create the first production admin with `npx tsx scripts/create-admin.ts` after the first deploy.
- [ ] Verify login at `/admin/login` and dashboard access.
- [ ] Review admin user list and deactivate or remove test accounts.

## Pre-launch verification

- [ ] Run `npm run format`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` locally.
- [ ] Run `npm run test:e2e` against a local database.
- [ ] Submit a test quote and confirm the thank-you page shows a reference number.
- [ ] Submit a test schedule request and confirm availability / thank-you flow.
- [ ] Confirm internal notification emails are received.
- [ ] Test photo upload on both quote and schedule forms.
- [ ] Test mobile navigation, bottom bar, and form keyboard navigation.
