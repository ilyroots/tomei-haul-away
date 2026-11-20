import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSignedDownloadUrl } from "@/lib/storage/s3";
import { logger } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

/** Only photos explicitly published in the gallery are public. Customer uploads stay private. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.galleryItem.findFirst({
      where: { id, isActive: true },
      select: { assetKey: true },
    });
    if (!item?.assetKey) return new NextResponse(null, { status: 404, headers });
    const url = await getSignedDownloadUrl(item.assetKey, 60);
    return NextResponse.redirect(url, { status: 307, headers });
  } catch (error) {
    logger.error("Unable to load published gallery photo", { error });
    return new NextResponse(null, { status: 503, headers });
  }
}
