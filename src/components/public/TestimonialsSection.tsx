import { getApprovedTestimonials } from "@/lib/public/data";

export async function TestimonialsSection() {
  const testimonials = await getApprovedTestimonials(6);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream py-16" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <h2
          id="testimonials-heading"
          className="text-center text-3xl font-bold text-navy md:text-4xl"
        >
          What customers say
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.id} className="rounded-xl bg-white p-6 shadow-sm">
              {testimonial.rating && (
                <p className="text-orange" aria-label={`Rating: ${testimonial.rating} out of 5`}>
                  {"★".repeat(testimonial.rating)}
                  {"☆".repeat(5 - testimonial.rating)}
                </p>
              )}
              <p className="mt-3 text-charcoal-700">{testimonial.content}</p>
              <footer className="mt-4">
                <p className="font-semibold text-navy">{testimonial.authorName}</p>
                {testimonial.location && (
                  <p className="text-sm text-charcoal-500">{testimonial.location}</p>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
