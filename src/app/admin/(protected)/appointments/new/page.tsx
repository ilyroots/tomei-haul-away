import { ManualAppointmentForm } from "../components/ManualAppointmentForm";

export default function NewAppointmentPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl font-bold text-brand-primary lg:text-3xl">
          New appointment
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Book a job manually, without a website lead.
        </p>
      </div>
      <ManualAppointmentForm />
    </div>
  );
}
