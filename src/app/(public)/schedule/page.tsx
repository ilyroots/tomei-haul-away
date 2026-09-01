import { Metadata } from "next";
import Image from "next/image";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { getScheduleSubmissionToken } from "./actions";
import { scheduleImage } from "@/lib/public/images";

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
        <h1 className="text-4xl font-bold text-brand-primary">Schedule an Appointment</h1>
        <p className="mt-2 text-lg text-brand-text/80">
          Pick a preferred time and we will follow up to confirm.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-3">
          <ScheduleForm submissionToken={submissionToken} turnstileSiteKey={turnstileSiteKey} />
        </div>
        <div className="relative hidden aspect-square w-full overflow-hidden rounded-xl lg:col-span-2 lg:block">
          <Image
            src={scheduleImage.src}
            alt={scheduleImage.alt}
            fill
            sizes="40vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
