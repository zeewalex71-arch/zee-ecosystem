import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/wallet/deposit - Initiate a deposit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit is ₦100" },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await db.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
          pendingBalance: 0,
        },
      });
    }

    // Generate reference
    const reference = `ZEE-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create pending transaction
    await db.transaction.create({
      data: {
        walletId: wallet.id,
        userId: session.user.id,
        type: "DEPOSIT",
        amount,
        fee: 0,
        status: "PENDING",
        paystackRef: reference,
        description: "Wallet deposit",
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
      },
    });

    // In production, this would call Paystack API to initialize transaction
    // For now, return a mock authorization URL
    const authorizationUrl = `https://paystack.com/pay/${reference}`;

    return NextResponse.json({
      authorizationUrl,
      reference,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
