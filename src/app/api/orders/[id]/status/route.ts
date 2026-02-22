import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/orders/[id]/status - Update order status
export async function PUT(
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
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, trackingNumber, deliveryFiles, deliveryNotes } = body;

    const updateData: any = {};

    // Status update logic based on user role
    if (session.user.id === order.sellerId) {
      // Seller can update status
      if (status) {
        updateData.status = status;

        if (status === "SHIPPED" && trackingNumber) {
          updateData.trackingNumber = trackingNumber;
          updateData.shippedAt = new Date();
        }

        if (status === "DELIVERED") {
          updateData.deliveredAt = new Date();
        }

        if (status === "IN_PROGRESS" && deliveryFiles) {
          updateData.deliveryFiles = JSON.stringify(deliveryFiles);
          updateData.deliveryNotes = deliveryNotes;
          updateData.deliveredAt_digital = new Date();
        }
      }
    } else if (session.user.id === order.buyerId) {
      // Buyer can only confirm delivery
      if (status === "COMPLETED") {
        updateData.status = "COMPLETED";
      }
    } else if (session.user.role === "ADMIN") {
      // Admin can do anything
      if (status) updateData.status = status;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    });

    // Create notification
    const notificationUserId =
      session.user.id === order.sellerId ? order.buyerId : order.sellerId;
    await db.notification.create({
      data: {
        userId: notificationUserId,
        type: "order",
        title: "Order Status Updated",
        content: `Order #${order.orderNumber} status changed to ${status || updatedOrder.status}`,
        link: `/dashboard/orders/${order.id}`,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
