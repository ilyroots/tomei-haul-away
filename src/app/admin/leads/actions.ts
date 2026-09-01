"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  updateLeadStatusSchema,
  updateLeadPriceSchema,
  internalNoteSchema,
} from "@/lib/validation/schemas";
import { requireAdmin, logAuditAction } from "@/lib/audit/audit";
import { logger } from "@/lib/logging/logger";
import { getSignedDownloadUrl } from "@/lib/storage/s3";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LeadFilters = {
  status?: LeadStatus;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type LeadsResult = {
  leads: Array<{
    id: string;
    referenceNumber: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
    status: LeadStatus;
    isInServiceArea: boolean | null;
    createdAt: Date;
    address: { city: string; state: string; zip: string } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type LeadDetail = Awaited<ReturnType<typeof getLeadById>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

function buildLeadSearchWhere(search?: string): Prisma.LeadWhereInput {
  if (!search || search.trim() === "") return {};

  const term = search.trim();
  const phoneTerm = term.replace(/\D/g, "");

  return {
    OR: [
      { contactName: { contains: term, mode: "insensitive" } },
      { contactEmail: { contains: term, mode: "insensitive" } },
      { referenceNumber: { contains: term, mode: "insensitive" } },
      ...(phoneTerm.length > 0 ? [{ contactPhone: { contains: phoneTerm } }] : []),
      {
        address: {
          OR: [
            { zip: { contains: term } },
            { city: { contains: term, mode: "insensitive" } },
            { line1: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    ],
  };
}

function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

// ---------------------------------------------------------------------------
// Read actions
// ---------------------------------------------------------------------------

export async function getLeads(filters: LeadFilters = {}): Promise<LeadsResult> {
  await requireAdmin();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.LeadWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...buildLeadSearchWhere(filters.search),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        address: { select: { city: true, state: true, zip: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads: leads.map((lead) => ({
      ...lead,
      contactPhone: lead.contactPhone ? lead.contactPhone : null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getLeadById(id: string) {
  await requireAdmin();

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      customer: true,
      address: true,
      services: { include: { service: true } },
      appointments: {
        orderBy: { scheduledDate: "asc" },
        include: { address: true },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      quoteRequests: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!lead) return null;

  const assets = await prisma.uploadedAsset.findMany({
    where: { ownerType: "Lead", ownerId: lead.id },
    orderBy: { createdAt: "desc" },
  });

  const signedAssets = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      signedUrl: await getSignedDownloadUrl(asset.key, 60 * 60),
    }))
  );

  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "Lead", entityId: lead.id },
    orderBy: { createdAt: "desc" },
    include: { changedBy: { select: { id: true, name: true, email: true } } },
  });

  return {
    ...lead,
    estimatedPriceMin: decimalToNumber(lead.estimatedPriceMin),
    estimatedPriceMax: decimalToNumber(lead.estimatedPriceMax),
    assets: signedAssets,
    statusHistory,
  };
}

// ---------------------------------------------------------------------------
// Mutation actions
// ---------------------------------------------------------------------------

export type ActionResult = { success: true } | { success: false; message: string };

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  reason?: string
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateLeadStatusSchema.safeParse({ leadId, status, reason });
  if (!parsed.success) {
    return { success: false, message: "Invalid input." };
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
    if (!lead) {
      return { success: false, message: "Lead not found." };
    }

    await prisma.$transaction([
      prisma.lead.update({
        where: { id: parsed.data.leadId },
        data: { status: parsed.data.status },
      }),
      prisma.statusHistory.create({
        data: {
          entityType: "Lead",
          entityId: parsed.data.leadId,
          fromStatus: lead.status,
          toStatus: parsed.data.status,
          changedById: session.user.id,
          reason: parsed.data.reason,
        },
      }),
    ]);

    await logAuditAction({
      action: "LEAD_STATUS_UPDATED",
      entityType: "Lead",
      entityId: parsed.data.leadId,
      metadata: {
        fromStatus: lead.status,
        toStatus: parsed.data.status,
        reason: parsed.data.reason,
      },
    });

    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update lead status", { error, leadId, status });
    return { success: false, message: "Failed to update lead status." };
  }
}

export async function updateLeadPrice(
  leadId: string,
  estimatedPriceMin?: number | undefined,
  estimatedPriceMax?: number | undefined
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = updateLeadPriceSchema.safeParse({ leadId, estimatedPriceMin, estimatedPriceMax });
  if (!parsed.success) {
    return { success: false, message: "Invalid price input." };
  }

  try {
    await prisma.lead.update({
      where: { id: parsed.data.leadId },
      data: {
        estimatedPriceMin: parsed.data.estimatedPriceMin ?? null,
        estimatedPriceMax: parsed.data.estimatedPriceMax ?? null,
      },
    });

    await logAuditAction({
      action: "LEAD_PRICE_UPDATED",
      entityType: "Lead",
      entityId: parsed.data.leadId,
      metadata: {
        estimatedPriceMin: parsed.data.estimatedPriceMin,
        estimatedPriceMax: parsed.data.estimatedPriceMax,
      },
    });

    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    return { success: true };
  } catch (error) {
    logger.error("Failed to update lead price", { error, leadId });
    return { success: false, message: "Failed to update lead price." };
  }
}

export async function addInternalNote(leadId: string, content: string): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = internalNoteSchema.safeParse({ content });
  if (!parsed.success) {
    return { success: false, message: "Note content is required." };
  }

  try {
    await prisma.internalNote.create({
      data: {
        leadId,
        authorId: session.user.id,
        content: parsed.data.content,
      },
    });

    await logAuditAction({
      action: "LEAD_NOTE_ADDED",
      entityType: "Lead",
      entityId: leadId,
      metadata: { authorId: session.user.id },
    });

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    logger.error("Failed to add internal note", { error, leadId });
    return { success: false, message: "Failed to add note." };
  }
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export type CsvExportResult =
  { success: true; csv: string; filename: string } | { success: false; message: string };

export async function exportLeadsCsv(filters: LeadFilters = {}): Promise<CsvExportResult> {
  await requireAdmin();

  const where: Prisma.LeadWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...buildLeadSearchWhere(filters.search),
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { address: true },
  });

  const headers = [
    "Reference",
    "Status",
    "Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "ZIP",
    "In Service Area",
    "Created At",
  ];

  function escapeCsv(value: string | null | undefined): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = leads.map((lead) => [
    lead.referenceNumber,
    lead.status,
    lead.contactName,
    lead.contactEmail,
    lead.contactPhone || "",
    lead.address
      ? `${lead.address.line1}${lead.address.line2 ? ` ${lead.address.line2}` : ""}`
      : "",
    lead.address?.city || "",
    lead.address?.state || "",
    lead.address?.zip || "",
    lead.isInServiceArea ? "Yes" : "No",
    lead.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

  await logAuditAction({
    action: "LEADS_EXPORTED",
    metadata: { count: leads.length, filters },
  });

  return { success: true, csv, filename: `leads-${new Date().toISOString().slice(0, 10)}.csv` };
}
