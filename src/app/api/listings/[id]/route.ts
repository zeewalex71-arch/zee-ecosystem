import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/listings/[id] - Get a single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count
    await db.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Parse JSON fields
    const parsedListing = {
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      tags: listing.tags ? JSON.parse(listing.tags) : [],
      shippingOptions: listing.shippingOptions
        ? JSON.parse(listing.shippingOptions)
        : null,
      dimensions: listing.dimensions
        ? JSON.parse(listing.dimensions)
        : null,
    };

    return NextResponse.json({ listing: parsedListing });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/listings/[id] - Update a listing
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

    const listing = await db.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    const allowedFields = [
      "title", "description", "price", "category", "subcategory",
      "tags", "images", "thumbnail", "portfolioUrl", "deliveryTime",
      "revisions", "requirements", "weight", "dimensions", "shippingOptions",
      "stockQuantity", "sku", "serviceArea", "availability", "duration", "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (["tags", "images", "dimensions", "shippingOptions"].includes(field)) {
          updateData[field] = body[field] ? JSON.stringify(body[field]) : null;
        } else if (["price", "weight"].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else if (["deliveryTime", "revisions", "stockQuantity", "duration"].includes(field)) {
          updateData[field] = body[field] ? parseInt(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedListing = await db.listing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await db.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.listing.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
