import {
  COMPANY_NAME,
  HOME_CITY,
  PHONE,
  TEXT_NUMBER,
  EMAIL,
  BUSINESS_HOURS,
  formatPhone,
} from "@/lib/business/config";

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-primary">{COMPANY_NAME}</h3>
        <p className="text-brand-text/70">Based in {HOME_CITY}</p>
      </div>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm font-semibold text-brand-muted">Phone</dt>
          <dd>
            <a
              href={`tel:${PHONE}`}
              className="text-lg font-medium text-brand-primary hover:text-brand-accent"
            >
              {formatPhone(PHONE)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-brand-muted">Text</dt>
          <dd>
            <a
              href={`sms:${TEXT_NUMBER}`}
              className="text-lg font-medium text-brand-primary hover:text-brand-accent"
            >
              {formatPhone(TEXT_NUMBER)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-brand-muted">Email</dt>
          <dd>
            <a
              href={`mailto:${EMAIL}`}
              className="text-lg font-medium text-brand-primary hover:text-brand-accent"
            >
              {EMAIL}
            </a>
          </dd>
        </div>
      </dl>
      <div>
        <h4 className="text-sm font-semibold text-brand-muted">Hours</h4>
        <ul className="mt-2 space-y-1 text-brand-text/90">
          {BUSINESS_HOURS.map(({ day, hours }) => (
            <li key={day} className="flex justify-between gap-4">
              <span>{day}</span>
              <span>{hours}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
