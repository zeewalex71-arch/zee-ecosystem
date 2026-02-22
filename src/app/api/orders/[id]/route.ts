import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            seller: {
              include: { profile: true },
            },
          },
        },
        buyer: {
          include: { profile: true },
        },
        seller: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { include: { profile: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check access
    if (
      order.buyerId !== session.user.id &&
      order.sellerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse JSON fields
    const parsedOrder = {
      ...order,
      shippingAddress: order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null,
      requirements: order.requirements
        ? JSON.parse(order.requirements)
        : null,
      deliveryFiles: order.deliveryFiles
        ? JSON.parse(order.deliveryFiles)
        : null,
    };

    return NextResponse.json({ order: parsedOrder });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
