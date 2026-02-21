import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = "BUYER" } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user with profile and wallet
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        profile: {
          create: {
            fullName: name,
            role,
          },
        },
        wallet: {
          create: {
            balance: 0,
            pendingBalance: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
