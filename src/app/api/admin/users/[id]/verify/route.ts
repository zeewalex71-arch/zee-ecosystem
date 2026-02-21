import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/admin/users/[id]/verify - Approve or reject seller verification
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
    const { approve } = body;

    const profile = await db.profile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updatedProfile = await db.profile.update({
      where: { userId: id },
      data: {
        isVerified: approve,
        verificationStatus: approve ? "approved" : "rejected",
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: id,
        type: "system",
        title: approve ? "Verification Approved" : "Verification Rejected",
        content: approve
          ? "Your seller verification has been approved. You can now start selling!"
          : "Your seller verification was rejected. Please check your documents and try again.",
      },
    });

    return NextResponse.json({ message: `Verification ${approve ? "approved" : "rejected"}` });
  } catch (error) {
    console.error("Verify user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
