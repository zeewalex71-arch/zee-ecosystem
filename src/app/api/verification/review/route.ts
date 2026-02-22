import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/verification/review - Get all pending verifications (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const verifications = await db.profile.findMany({
      where: {
        verificationStatus: status,
        role: "SELLER",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        verificationSubmittedAt: "asc",
      },
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Get verifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/verification/review - Approve or reject verification (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, action, rejectionReason, rejectionDetails } = body;

    if (!profileId || !action) {
      return NextResponse.json(
        { error: "Profile ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting" },
        { status: 400 }
      );
    }

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Approve the seller
      const updatedProfile = await db.profile.update({
        where: { id: profileId },
        data: {
          isVerified: true,
          verificationStatus: "verified",
          verificationReviewedAt: new Date(),
          verificationReviewedBy: session.user.id,
          rejectionReason: null,
          rejectionDetails: null,
        },
      });

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: profile.userId,
          type: "verification",
          title: "🎉 Congratulations! You are now a Zee-Vetted Seller!",
          content: "Your verification has been approved. Start listing your genius!",
          link: "/dashboard/seller/listings/new",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Seller verified successfully",
        profile: updatedProfile,
      });
    } else {
      // Reject the seller
      const updatedProfile = await db.profile.update({
        where: { id: profileId },
        data: {
          isVerified: false,
          verificationStatus: "rejected",
          verificationReviewedAt: new Date(),
          verificationReviewedBy: session.user.id,
          rejectionReason,
          rejectionDetails: rejectionDetails || null,
        },
      });

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: profile.userId,
          type: "verification",
          title: "Verification Rejected",
          content: `Your verification was rejected: ${rejectionReason}. Please re-upload correct details.`,
          link: "/dashboard/seller/verification",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Verification rejected",
        profile: updatedProfile,
      });
    }
  } catch (error) {
    console.error("Review verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
