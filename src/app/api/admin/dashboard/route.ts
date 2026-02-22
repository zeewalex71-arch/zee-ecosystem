import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/dashboard - Get admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stats
    const [
      totalUsers,
      totalListings,
      totalOrders,
      pendingVerifications,
      activeDisputes,
      revenueResult,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count({ where: { status: "ACTIVE" } }),
      db.order.count(),
      db.profile.count({ where: { verificationStatus: "pending" } }),
      db.order.count({ where: { disputeStatus: "open" } }),
      db.transaction.aggregate({
        where: {
          type: "ESCROW_RELEASE",
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = revenueResult._sum.amount || 0;

    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { include: { profile: true } },
        listing: true,
      },
    });

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalOrders,
      totalRevenue,
      pendingVerifications,
      activeDisputes,
      recentOrders,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
