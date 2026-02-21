import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/admin/disputes/[id]/resolve - Resolve a dispute
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
    const { resolution, notes } = body;

    if (!resolution || !["release_to_seller", "refund_buyer"].includes(resolution)) {
      return NextResponse.json(
        { error: "Valid resolution type is required" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { buyer: true, seller: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order and handle escrow
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: resolution === "release_to_seller" ? "COMPLETED" : "REFUNDED",
          escrowStatus: resolution === "release_to_seller" ? "RELEASED" : "REFUNDED",
          disputeStatus: "resolved",
          disputeResolution: notes || (resolution === "release_to_seller" ? "Released to seller" : "Refunded to buyer"),
          disputeResolvedBy: session.user.id,
          escrowReleasedAt: new Date(),
        },
      });

      // If refunding buyer, update their wallet
      if (resolution === "refund_buyer") {
        const buyerWallet = await tx.wallet.findUnique({
          where: { userId: order.buyerId },
        });

        if (buyerWallet) {
          await tx.wallet.update({
            where: { userId: order.buyerId },
            data: {
              balance: { increment: order.totalAmount },
              pendingBalance: { decrement: order.totalAmount },
            },
          });

          await tx.transaction.create({
            data: {
              walletId: buyerWallet.id,
              userId: order.buyerId,
              type: "REFUND",
              amount: order.totalAmount,
              fee: 0,
              status: "COMPLETED",
              orderId: order.id,
              description: `Refund for disputed order #${order.orderNumber}`,
              balanceBefore: buyerWallet.balance,
              balanceAfter: buyerWallet.balance + order.totalAmount,
            },
          });
        }
      } else {
        // Release to seller
        const sellerWallet = await tx.wallet.findUnique({
          where: { userId: order.sellerId },
        });

        if (sellerWallet) {
          await tx.wallet.update({
            where: { userId: order.sellerId },
            data: {
              balance: { increment: order.totalAmount - order.serviceFee },
              pendingBalance: { decrement: order.totalAmount },
              totalEarned: { increment: order.totalAmount - order.serviceFee },
            },
          });

          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              userId: order.sellerId,
              type: "ESCROW_RELEASE",
              amount: order.totalAmount - order.serviceFee,
              fee: order.serviceFee,
              status: "COMPLETED",
              orderId: order.id,
              description: `Payment released for order #${order.orderNumber}`,
              balanceBefore: sellerWallet.balance,
              balanceAfter: sellerWallet.balance + order.totalAmount - order.serviceFee,
            },
          });
        }
      }

      // Create notifications
      await tx.notification.createMany({
        data: [
          {
            userId: order.buyerId,
            type: "dispute",
            title: "Dispute Resolved",
            content: resolution === "refund_buyer"
              ? "Your dispute has been resolved. A refund has been issued to your wallet."
              : "Your dispute has been resolved. Payment has been released to the seller.",
          },
          {
            userId: order.sellerId,
            type: "dispute",
            title: "Dispute Resolved",
            content: resolution === "release_to_seller"
              ? "The dispute has been resolved in your favor. Payment has been released to your wallet."
              : "The dispute has been resolved. A refund has been issued to the buyer.",
          },
        ],
      });

      return updated;
    });

    return NextResponse.json({ order: updatedOrder, message: "Dispute resolved successfully" });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
