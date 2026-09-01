import { Metadata } from "next";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { getScheduleSubmissionToken } from "./actions";

export const metadata: Metadata = {
  title: "Schedule an Appointment",
  description: "Request a junk removal appointment. We will confirm shortly.",
};

export default async function SchedulePage() {
  const submissionToken = await getScheduleSubmissionToken();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-navy">Schedule an Appointment</h1>
        <p className="mt-2 text-lg text-charcoal-600">
          Pick a preferred time and we will follow up to confirm.
        </p>
      </div>
      <ScheduleForm submissionToken={submissionToken} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
