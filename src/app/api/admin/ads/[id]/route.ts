import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/admin/ads/[id] - Toggle ad status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive } = body;

    const ad = await db.ad.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Update ad error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads/[id] - Delete an ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First delete all ad clicks
    await db.adClick.deleteMany({
      where: { adId: id },
    });

    // Then delete the ad
    await db.ad.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Delete ad error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
