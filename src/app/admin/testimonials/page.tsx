import { getTestimonials } from "./actions";
import { TestimonialForm } from "./components/TestimonialForm";
import { ToggleApprovalButton } from "./components/ToggleApprovalButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream">Testimonials</h1>
        <p className="mt-1 text-cream-200">Manage customer testimonials.</p>
      </div>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Add testimonial</h2>
        <TestimonialForm />
      </section>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Testimonials</h2>
        {testimonials.length === 0 ? (
          <p className="text-cream-200">No testimonials yet.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-lg border border-charcoal-600 bg-charcoal-800 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-cream">{testimonial.authorName}</h3>
                    {testimonial.location && (
                      <p className="text-sm text-cream-200">{testimonial.location}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      testimonial.isApproved
                        ? "bg-green-900 text-green-100"
                        : "bg-charcoal-600 text-cream-200"
                    }`}
                  >
                    {testimonial.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-cream">{testimonial.content}</p>
                {testimonial.rating && (
                  <p className="mt-2 text-sm text-orange">{"★".repeat(testimonial.rating)}</p>
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
  );
}
