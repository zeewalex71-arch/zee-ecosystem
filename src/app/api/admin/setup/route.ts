import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

// POST /api/admin/setup - Create initial admin user (only if no admin exists)
export async function POST(request: NextRequest) {
  try {
    // Check if any admin already exists
    const existingAdmin = await db.profile.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists. Use the registration flow instead." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to be admin
      const hashedPassword = await hash(password, 10);
      
      await db.user.update({
        where: { id: existingUser.id },
        data: { passwordHash: hashedPassword, name },
      });

      await db.profile.upsert({
        where: { userId: existingUser.id },
        create: {
          userId: existingUser.id,
          role: "ADMIN",
          isVerified: true,
          verificationStatus: "approved",
          fullName: name,
        },
        update: {
          role: "ADMIN",
          isVerified: true,
          verificationStatus: "approved",
          fullName: name,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Admin account created successfully!",
        user: { email, name, role: "ADMIN" },
      });
    }

    // Create new admin user
    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        profile: {
          create: {
            role: "ADMIN",
            isVerified: true,
            verificationStatus: "approved",
            fullName: name,
          },
        },
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.profile?.role,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}

// GET /api/admin/setup - Check if admin setup is needed
export async function GET() {
  try {
    const adminCount = await db.profile.count({
      where: { role: "ADMIN" },
    });

    return NextResponse.json({
      needsSetup: adminCount === 0,
      adminCount,
    });
  } catch (error) {
    console.error("Check admin setup error:", error);
    return NextResponse.json({ needsSetup: true, adminCount: 0 });
  }
}
