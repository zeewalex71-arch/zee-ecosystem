import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/buyer - Get orders for the current buyer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { buyerId: session.user.id },
      include: {
        listing: {
          include: {
            seller: {
              include: { profile: true },
            },
          },
        },
        seller: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields
    const parsedOrders = orders.map((order) => ({
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
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error) {
    console.error("Get buyer orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
