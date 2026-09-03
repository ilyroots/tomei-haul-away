import { getTestimonials } from "./actions";
import { TestimonialForm } from "./components/TestimonialForm";
import { ToggleApprovalButton } from "./components/ToggleApprovalButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl lg:text-3xl font-bold text-brand-primary">
          Testimonials
        </h1>
        <p className="mt-1 text-sm text-brand-muted">Manage customer testimonials.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Add testimonial</h2>
          <TestimonialForm />
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Testimonials</h2>
          {testimonials.length === 0 ? (
            <p className="text-sm text-brand-muted">No testimonials yet.</p>
          ) : (
            <div>
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border-b border-brand-border p-4 last:border-b-0 hover:bg-brand-background/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{testimonial.authorName}</h3>
                      {testimonial.location && (
                        <p className="text-sm text-brand-muted">{testimonial.location}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        testimonial.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-brand-background text-brand-muted"
                      }`}
                    >
                      {testimonial.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{testimonial.content}</p>
                  {testimonial.rating && (
                    <p className="mt-2 text-sm text-brand-accent">
                      {"★".repeat(testimonial.rating)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <TestimonialForm item={testimonial} />
                    <ToggleApprovalButton id={testimonial.id} isApproved={testimonial.isApproved} />
                    <DeleteButton id={testimonial.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
