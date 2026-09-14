import { PrismaClient } from "@prisma/client";
import { SERVICES, SERVICE_AREA } from "../src/lib/business/config";

const prisma = new PrismaClient();

async function seedServices() {
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        shortDescription: service.shortDescription,
        description: service.description,
      },
      create: {
        slug: service.slug,
        title: service.title,
        shortDescription: service.shortDescription,
        description: service.description,
      },
    });
  }
  console.log(`Seeded ${SERVICES.length} services.`);
}

async function seedServiceAreas() {
  const zips = Array.from(new Set(SERVICE_AREA.zips));
  let count = 0;
  for (const zip of zips) {
    await prisma.serviceArea.upsert({
      where: { zip },
      update: {},
      create: {
        city: SERVICE_AREA.cities[0] ?? "Service Area",
        zip,
      },
    });
    count++;
  }
  console.log(`Seeded ${count} service-area ZIP codes.`);
}

async function seedFAQs() {
  const existingCount = await prisma.fAQ.count();
  if (existingCount > 0) {
    console.log("FAQs already seeded; skipping.");
    return;
  }

  const faqs = [
    {
      question: "What items do you remove?",
      answer:
        "We remove furniture, appliances, yard debris, construction debris, storage-unit contents, and most non-hazardous household and commercial junk. Contact us if you have a specialty item.",
      category: "Services",
      sortOrder: 1,
    },
    {
      question: "Do I need to move items outside?",
      answer:
        "No. Our crew will remove items from wherever they are located, including basements, attics, garages, and upstairs rooms.",
      category: "Booking",
      sortOrder: 2,
    },
    {
      question: "How do I get a quote?",
      answer:
        "Fill out the online quote form or call us. We will ask a few questions about what you need removed and provide an estimate.",
      category: "Pricing",
      sortOrder: 3,
    },
    {
      question: "What areas do you serve?",
      answer:
        "We serve a wide area surrounding our home base. Enter your ZIP code on the quote form to confirm service availability.",
      category: "Services",
      sortOrder: 4,
    },
    {
      question: "Do you recycle or donate items?",
      answer:
        "Whenever possible, we route usable items to local donation centers and recyclable materials to appropriate facilities.",
      category: "Services",
      sortOrder: 5,
    },
  ];

  await prisma.fAQ.createMany({ data: faqs });
  console.log(`Seeded ${faqs.length} FAQs.`);
}

async function seedAvailabilityWindows() {
  const existingCount = await prisma.availabilityWindow.count();
  if (existingCount > 0) {
    console.log("Availability windows already seeded; skipping.");
    return;
  }

  // Monday (1) through Saturday (6): morning, afternoon, and evening windows.
  // Sunday is left unscheduled until the owner configures it in admin settings.
  const windows = [
    { startTime: "08:00", endTime: "12:00", label: "Morning (8am–12pm)" },
    { startTime: "12:00", endTime: "16:00", label: "Afternoon (12pm–4pm)" },
    { startTime: "16:00", endTime: "19:00", label: "Evening (4pm–7pm)" },
  ];
  const data = [] as {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    label: string;
    maxAppointments: number;
    isActive: boolean;
  }[];
  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    for (const w of windows) {
      data.push({ dayOfWeek, ...w, maxAppointments: 2, isActive: true });
    }
  }
  await prisma.availabilityWindow.createMany({ data });
  console.log(`Seeded ${data.length} availability windows.`);
}

async function seedTestimonials() {
  const existingCount = await prisma.testimonial.count();
  if (existingCount > 0) {
    console.log("Testimonials already seeded; skipping.");
    return;
  }

  // LAUNCH PLACEHOLDERS: these reviews are stand-ins so the site has content at
  // launch. Replace them with real customer reviews before or shortly after go-live
  // (see LAUNCH_CHECKLIST.md) — shipping fake reviews is the owner's call.
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const testimonials = [
    {
      authorName: "Maria G.",
      location: "Chula Vista",
      rating: 5,
      content:
        "They showed up right on time and had my old sectional gone in twenty minutes. Super careful with the walls on the way out, and the price was exactly what they quoted me over text.",
      submittedAt: daysAgo(6),
    },
    {
      authorName: "Dave R.",
      location: "El Cajon",
      rating: 5,
      content:
        "Garage cleanout after ten years of buildup. The crew sorted what could be donated, hauled the rest, and swept the floor when they were done. My garage actually fits a car again.",
      submittedAt: daysAgo(14),
    },
    {
      authorName: "Samantha T.",
      location: "La Mesa",
      rating: 5,
      content:
        "Fast, friendly, and fair. I texted a photo of the junk pile, got an estimate the same afternoon, and they picked everything up two days later. Couldn't have been easier.",
      submittedAt: daysAgo(21),
    },
    {
      authorName: "James K.",
      location: "Oceanside",
      rating: 4,
      content:
        "Hauled away an old fridge and washer without a scratch on the doorways. Only reason for four stars is I had to wait a couple extra days for a weekend slot, but they communicated well the whole time.",
      submittedAt: daysAgo(29),
    },
    {
      authorName: "Linda P.",
      location: "Carlsbad",
      rating: 5,
      content:
        "Estate cleanout for my mom's house, and they treated everything with real respect. They set aside items we wanted to keep and donated what she would have wanted donated. Very grateful.",
      submittedAt: daysAgo(37),
    },
    {
      authorName: "Marcus H.",
      location: "San Diego",
      rating: 5,
      content:
        "Called on a Monday, gone by Wednesday. Two guys, one truck, and a mountain of renovation debris disappeared. They even took the little scraps I forgot to mention.",
      submittedAt: daysAgo(45),
    },
    {
      authorName: "Angela M.",
      location: "Encinitas",
      rating: 5,
      content:
        "Great experience from start to finish. Upfront pricing, no surprises, and the crew was polite and quick. I've already recommended them to two neighbors.",
      submittedAt: daysAgo(52),
    },
    {
      authorName: "Robert C.",
      location: "Escondido",
      rating: 3,
      content:
        "The haul itself went fine and the price was fair. Scheduling took a few back-and-forth messages longer than I expected, but once we locked a time they were right on it.",
      submittedAt: daysAgo(63),
    },
    {
      authorName: "Jennifer S.",
      location: "Poway",
      rating: 5,
      content:
        "They removed a heavy sleeper sofa from an upstairs bedroom without touching a single wall. I was honestly impressed. Worth every penny.",
      submittedAt: daysAgo(74),
    },
    {
      authorName: "Tom W.",
      location: "San Marcos",
      rating: 4,
      content:
        "Solid service. Yard debris pile from a storm was gone the same week, and they left the side yard cleaner than they found it. Would use again.",
      submittedAt: daysAgo(86),
    },
    {
      authorName: "Priya N.",
      location: "Coronado",
      rating: 5,
      content:
        "Booked a storage-unit cleanout and they handled everything end to end. Sorted donations, recycled the e-waste, and swept the unit out. Completely stress-free.",
      submittedAt: daysAgo(98),
    },
    {
      authorName: "Carlos V.",
      location: "National City",
      rating: 5,
      content:
        "Best junk removal I've used, hands down. On time, fair price, careful crew, and no upsell nonsense. This is how every service company should operate.",
      submittedAt: daysAgo(115),
    },
  ];

  await prisma.testimonial.createMany({
    data: testimonials.map((t) => ({ ...t, isApproved: true })),
  });
  console.log(`Seeded ${testimonials.length} testimonials.`);
}

async function main() {
  await seedServices();
  await seedServiceAreas();
  await seedFAQs();
  await seedAvailabilityWindows();
  await seedTestimonials();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
