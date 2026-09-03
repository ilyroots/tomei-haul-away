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

async function main() {
  await seedServices();
  await seedServiceAreas();
  await seedFAQs();
  await seedAvailabilityWindows();
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
