import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/ads - Get active ads for carousel
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placement = searchParams.get("placement") || "HERO_CAROUSEL";

    const now = new Date();

    const ads = await db.ad.findMany({
      where: {
        isActive: true,
        placement,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Get ads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
