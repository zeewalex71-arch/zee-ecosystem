import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/users - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: any = {};

    if (role) {
      where.profile = { role };
    }

    if (status === "banned") {
      where.profile = { ...where.profile, isBanned: true };
    } else if (status === "verified") {
      where.profile = { ...where.profile, isVerified: true };
    } else if (status === "pending_verification") {
      where.profile = { ...where.profile, verificationStatus: "pending" };
    }

    const users = await db.user.findMany({
      where,
      include: {
        profile: true,
        wallet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
