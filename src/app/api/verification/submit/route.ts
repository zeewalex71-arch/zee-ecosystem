import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/verification/submit - Submit verification documents
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      legalFullName,
      idType,
      idNumber,
      idDocument,
      businessName,
      businessCategory,
      businessBio,
      businessStreet,
      businessCity,
      businessState,
      businessPostalCode,
      shopFrontPhoto,
      videoTourUrl,
    } = body;

    // Validate required fields
    if (!legalFullName || !idType || !idNumber || !idDocument) {
      return NextResponse.json(
        { error: "Legal name, ID type, ID number, and ID document are required" },
        { status: 400 }
      );
    }

    if (!businessName || !businessCategory || !businessStreet || !businessCity || !businessState) {
      return NextResponse.json(
        { error: "Business name, category, and address are required" },
        { status: 400 }
      );
    }

    // Get existing profile
    const existingProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if already verified or pending
    if (existingProfile.verificationStatus === "verified") {
      return NextResponse.json(
        { error: "You are already verified" },
        { status: 400 }
      );
    }

    // Update profile with verification data
    const updatedProfile = await db.profile.update({
      where: { userId: session.user.id },
      data: {
        legalFullName,
        idType,
        idNumber,
        idDocument,
        businessName,
        businessCategory,
        businessBio,
        businessStreet,
        businessCity,
        businessState,
        businessPostalCode,
        shopFrontPhoto,
        videoTourUrl,
        verificationStatus: "pending",
        verificationSubmittedAt: new Date(),
        rejectionReason: null,
        rejectionDetails: null,
        // Update role to SELLER if not already
        role: existingProfile.role === "BUYER" ? "SELLER" : existingProfile.role,
        // Update store name for compatibility
        storeName: businessName,
        storeDescription: businessBio,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verification submitted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Submit verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/verification/submit - Update/resubmit verification
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      legalFullName,
      idType,
      idNumber,
      idDocument,
      businessName,
      businessCategory,
      businessBio,
      businessStreet,
      businessCity,
      businessState,
      businessPostalCode,
      shopFrontPhoto,
      videoTourUrl,
    } = body;

    // Update profile with new verification data
    const updatedProfile = await db.profile.update({
      where: { userId: session.user.id },
      data: {
        legalFullName,
        idType,
        idNumber,
        idDocument,
        businessName,
        businessCategory,
        businessBio,
        businessStreet,
        businessCity,
        businessState,
        businessPostalCode,
        shopFrontPhoto,
        videoTourUrl,
        verificationStatus: "pending",
        verificationSubmittedAt: new Date(),
        verificationReviewedAt: null,
        verificationReviewedBy: null,
        rejectionReason: null,
        rejectionDetails: null,
        storeName: businessName,
        storeDescription: businessBio,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verification resubmitted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
