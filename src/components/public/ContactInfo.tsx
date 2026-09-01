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
        <h3 className="text-lg font-semibold text-navy">{COMPANY_NAME}</h3>
        <p className="text-charcoal-600">Based in {HOME_CITY}</p>
      </div>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm font-semibold text-charcoal-500">Phone</dt>
          <dd>
            <a href={`tel:${PHONE}`} className="text-lg font-medium text-navy hover:text-orange">
              {formatPhone(PHONE)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-charcoal-500">Text</dt>
          <dd>
            <a
              href={`sms:${TEXT_NUMBER}`}
              className="text-lg font-medium text-navy hover:text-orange"
            >
              {formatPhone(TEXT_NUMBER)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-charcoal-500">Email</dt>
          <dd>
            <a href={`mailto:${EMAIL}`} className="text-lg font-medium text-navy hover:text-orange">
              {EMAIL}
            </a>
          </dd>
        </div>
      </dl>
      <div>
        <h4 className="text-sm font-semibold text-charcoal-500">Hours</h4>
        <ul className="mt-2 space-y-1 text-charcoal-700">
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
