import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST - Send OTP to email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (using VerificationToken model)
    const identifier = email || phone;

    // Delete any existing OTP for this identifier
    await db.verificationToken.deleteMany({
      where: { identifier },
    });

    // Create new OTP
    await db.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires: expiresAt,
      },
    });

    // In production, send actual email/SMS here
    // For demo, we'll return the OTP in response
    console.log(`OTP for ${identifier}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Return OTP for demo purposes (remove in production)
      otp,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// PUT - Verify OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, otp } = body;

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const identifier = email || phone;

    // Find the OTP record
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier,
        token: otp,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired OTP",
      }, { status: 400 });
    }

    // Delete the used OTP
    await db.verificationToken.delete({
      where: { identifier_token: { identifier, token: otp } },
    });

    // Mark user as verified if exists
    const user = await db.user.findUnique({
      where: email ? { email } : { phone: phone! },
    });

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      userId: user?.id,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
