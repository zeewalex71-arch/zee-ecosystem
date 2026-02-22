import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZEE-${timestamp}-${random}`;
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, quantity = 1, requirements, shippingAddress } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot order your own listing" },
        { status: 400 }
      );
    }

    // Check stock for physical goods
    if (listing.type === "PHYSICAL" && listing.stockQuantity) {
      if (quantity > listing.stockQuantity) {
        return NextResponse.json(
          { error: "Not enough stock available" },
          { status: 400 }
        );
      }
    }

    const totalAmount = listing.price * quantity;
    const serviceFee = totalAmount * 0.05; // 5% service fee

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        quantity,
        unitPrice: listing.price,
        totalAmount,
        serviceFee,
        status: "PENDING",
        escrowStatus: "NONE",
        requirements: requirements ? JSON.stringify(requirements) : null,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
      },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        listing: true,
      },
    });

    // Create notification for seller
    await db.notification.create({
      data: {
        userId: listing.sellerId,
        type: "order",
        title: "New Order Received",
        content: `You have a new order for "${listing.title}"`,
        link: `/dashboard/seller/orders/${order.id}`,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
