"use server";

import { requireAdmin } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";

export type DashboardSummary = {
  newLeadsCount: number;
  upcomingRequestsCount: number;
  followUpLeadsCount: number;
  recentLeads: {
    id: string;
    referenceNumber: string;
    contactName: string;
    status: string;
    createdAt: Date;
  }[];
  upcomingAppointments: {
    id: string;
    scheduledDate: Date;
    arrivalWindow: string | null;
    status: string;
    leadId: string | null;
    contactName: string | null;
  }[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    newLeadsCount,
    upcomingRequestsCount,
    followUpLeadsCount,
    recentLeads,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.appointment.count({
      where: { status: "REQUESTED", scheduledDate: { gte: todayStart } },
    }),
    prisma.lead.count({
      where: { status: { in: ["NEW", "CONTACTED", "NEEDS_INFO"] } },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, referenceNumber: true, contactName: true, status: true, createdAt: true },
    }),
    prisma.appointment.findMany({
      where: { scheduledDate: { gte: todayStart } },
      orderBy: { scheduledDate: "asc" },
      take: 5,
      select: {
        id: true,
        scheduledDate: true,
        arrivalWindow: true,
        arrivalWindowLabel: true,
        status: true,
        leadId: true,
        lead: { select: { contactName: true } },
      },
    }),
  ]);

  return {
    newLeadsCount,
    upcomingRequestsCount,
    followUpLeadsCount,
    recentLeads,
    upcomingAppointments: upcomingAppointments.map((appt) => ({
      id: appt.id,
      scheduledDate: appt.scheduledDate,
      arrivalWindow: appt.arrivalWindowLabel ?? appt.arrivalWindow ?? null,
      status: appt.status,
      leadId: appt.leadId,
      contactName: appt.lead?.contactName ?? null,
    })),
  };
}
