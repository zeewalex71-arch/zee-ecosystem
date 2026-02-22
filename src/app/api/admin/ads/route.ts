import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/ads - Get all ads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ads = await db.ad.findMany({
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

// POST /api/admin/ads - Create a new ad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      placement = "HERO_CAROUSEL",
      targetMarketplaces,
      startDate,
      endDate,
      isActive = true,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const ad = await db.ad.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        placement,
        targetMarketplaces: targetMarketplaces
          ? JSON.stringify(targetMarketplaces)
          : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
      },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
