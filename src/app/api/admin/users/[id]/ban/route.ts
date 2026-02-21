import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/admin/users/[id]/ban - Ban or unban a user
export async function POST(
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
    const { ban, reason } = body;

    const profile = await db.profile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updatedProfile = await db.profile.update({
      where: { userId: id },
      data: {
        isBanned: ban,
        bannedReason: ban ? reason : null,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: id,
        type: "system",
        title: ban ? "Account Banned" : "Account Restored",
        content: ban
          ? `Your account has been banned. Reason: ${reason}`
          : "Your account has been restored.",
      },
    });

    return NextResponse.json({ message: `User ${ban ? "banned" : "unbanned"}` });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
