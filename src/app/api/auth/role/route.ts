import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Update user role (Buyer/Seller)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["BUYER", "SELLER"].includes(role.toUpperCase())) {
      return NextResponse.json({ error: "Invalid role. Must be BUYER or SELLER" }, { status: 400 });
    }

    // Update user profile with new role
    const profile = await db.profile.update({
      where: { userId: session.user.id },
      data: { role: role.toUpperCase() },
    });

    return NextResponse.json({
      success: true,
      role: profile.role,
      message: `Role updated to ${profile.role}`,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// GET - Get current user role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    return NextResponse.json({
      role: profile?.role || "BUYER",
    });
  } catch (error) {
    console.error("Get role error:", error);
    return NextResponse.json({ error: "Failed to get role" }, { status: 500 });
  }
}
