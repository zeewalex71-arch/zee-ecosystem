import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/verification/status - Get user's verification status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        isVerified: true,
        verificationStatus: true,
        legalFullName: true,
        idType: true,
        idNumber: true,
        idDocument: true,
        businessName: true,
        businessCategory: true,
        businessBio: true,
        businessStreet: true,
        businessCity: true,
        businessState: true,
        businessPostalCode: true,
        shopFrontPhoto: true,
        videoTourUrl: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        rejectionReason: true,
        rejectionDetails: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ verification: profile });
  } catch (error) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
