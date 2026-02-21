import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/disputes - Get all disputed orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "open";

    const where: any = {};
    if (status !== "all") {
      where.disputeStatus = status;
    }

    const orders = await db.order.findMany({
      where: {
        disputeReason: { not: null },
        ...where,
      },
      include: {
        buyer: {
          include: {
            profile: true,
          },
        },
        seller: {
          include: {
            profile: true,
          },
        },
        listing: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            sender: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get disputes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
