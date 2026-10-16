# DreHauling Production V1 Checklist

Last verified: 2026-10-16

## Verified complete in the repository

- DreHauling branding, phone/text number, logo assets, and blue/orange visual system are implemented.
- Public homepage has a compact sticky header, hero quote-start selection, category service rail, responsive process timeline, and data-driven reviews.
- Public SEO routes and the existing quote, schedule, authentication, and admin route structure remain intact.
- Quote submission saves the lead, address, selected service, quote request, uploaded-asset metadata, and audit log before sending notifications.
- Duplicate submission tokens, honeypot checks, completion-time checks, rate limiting, Turnstile verification, server-side validation, and file validation are present.
- Resend email integration fails closed in production when the API key or sender is missing; notification failures are logged and surfaced without claiming delivery.
- A saved quote remains a successful submission when notification delivery fails; the customer receives the reference number and recovery guidance instead of being prompted to resubmit.
- User-supplied values included in notification HTML are escaped, and owner links use the protected lead ID route.
- Production Docker configuration runs Prisma migrations as Railway's pre-deploy command and includes the runtime files used by the seed script.
- Approved testimonials are the only data rendered publicly; the homepage review section is hidden when none exist.

## Local evidence

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test -- --run` — passed: 7 files, 74 tests.
- `npm run build` — passed: Next.js generated 66 routes.
- `git diff --check` — passed on the latest verified changes.
- Local desktop/mobile browser review completed for the homepage and quote-start interaction.

## Remaining work before customer launch

- Configure and verify production environment variables in Railway without committing values:
  `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
  `BUSINESS_NOTIFICATION_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  and all required S3 variables.
- Confirm `RESEND_FROM_EMAIL` uses the verified DreHauling sending domain and that the owner destination is `elexcruz226@gmail.com`.
- Verify durable S3 uploads on Railway and authorized signed-download access from the admin lead detail page.
- Verify the production database has the current migrations and availability windows. Do not run migrations, seeds, or production-data changes without explicit approval.
- Perform one clearly approved live quote rehearsal and verify one lead, saved fields/photos, owner email, customer receipt, and admin visibility.
- Confirm admin authentication, authorization, lead status updates, notes, appointment association, and protected photo access on the deployed build.
- Decide whether SMS is deferred or approve a provider/number setup. No live SMS integration is currently present.
- Add a durable notification outbox/retry mechanism if notification recovery is required for launch; current quote submission awaits email sends and logs failures but does not persist a retry queue.
- Complete a sitewide image/license review before removing the Photo Credits link. Placeholder assets remain on several secondary public pages and must not be presented as documentary business photography.
- Verify canonical domain redirects, HTTPS, Turnstile hostname, Railway commit linkage, backups, and rollback procedure.

## External dependencies

- Railway production variables and deployment logs.
- PostgreSQL migration state and availability-window state.
- Resend verified domain, restricted sending key, sender address, and delivery events.
- Cloud object storage bucket, credentials, CORS, and lifecycle/backup policy.
- Cloudflare Turnstile production site/secret configuration.
- Optional SMS provider account, number, verification, and US messaging registration.

## Release blockers

1. No live owner-email delivery rehearsal has been performed.
2. Durable production upload storage and protected admin download have not been live-verified.
3. Production database migration/availability state has not been inspected in this session.
4. SMS alerts are not implemented or live-verified.
5. Secondary-page placeholder imagery and attribution requirements still need an approved asset decision.

## Approval boundaries

Do not run production migrations/seeds, submit live test quotes, send real emails/SMS, change DNS/Railway variables, purchase provider services, or delete production data without explicit approval for that action.
