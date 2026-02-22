import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/wallet - Get user's wallet
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let wallet = await db.wallet.findUnique({
      where: { userId: session.user.id },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
          pendingBalance: 0,
        },
      });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
