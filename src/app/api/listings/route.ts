import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch all listings for the current seller
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { sellerId: session.user.id };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const listings = await db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Fetch listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

// POST - Create a new listing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      price, 
      currency,
      type,
      category,
      subcategory,
      tags,
      images,
      thumbnail,
      deliveryTime,
      revisions,
      requirements,
      weight,
      dimensions,
      stockQuantity,
      serviceArea,
      duration,
    } = body;

    // Validation
    if (!title || !description || !price || !category) {
      return NextResponse.json({ 
        error: "Title, description, price, and category are required" 
      }, { status: 400 });
    }

    // Generate unique order number for listing ID
    const listingCount = await db.listing.count();
    const orderNumber = `ZEE${String(listingCount + 1).padStart(6, '0')}`;

    const listing = await db.listing.create({
      data: {
        sellerId: session.user.id,
        title,
        description,
        price: parseFloat(price),
        currency: currency || "NGN",
        type: type || "SERVICE",
        category,
        subcategory,
        tags: tags ? JSON.stringify(tags) : null,
        images: images ? JSON.stringify(images) : null,
        thumbnail,
        deliveryTime: deliveryTime ? parseInt(deliveryTime) : null,
        revisions: revisions ? parseInt(revisions) : null,
        requirements,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : null,
        serviceArea,
        duration: duration ? parseInt(duration) : null,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ 
      success: true, 
      listing,
      message: "Listing created successfully" 
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

// PUT - Update a listing
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    // Check if listing belongs to the seller
    const existingListing = await db.listing.findFirst({
      where: { id, sellerId: session.user.id },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};
    if (updateData.title) data.title = updateData.title;
    if (updateData.description) data.description = updateData.description;
    if (updateData.price) data.price = parseFloat(updateData.price);
    if (updateData.currency) data.currency = updateData.currency;
    if (updateData.type) data.type = updateData.type;
    if (updateData.category) data.category = updateData.category;
    if (updateData.subcategory) data.subcategory = updateData.subcategory;
    if (updateData.tags) data.tags = JSON.stringify(updateData.tags);
    if (updateData.images) data.images = JSON.stringify(updateData.images);
    if (updateData.thumbnail !== undefined) data.thumbnail = updateData.thumbnail;
    if (updateData.deliveryTime) data.deliveryTime = parseInt(updateData.deliveryTime);
    if (updateData.revisions !== undefined) data.revisions = parseInt(updateData.revisions);
    if (updateData.requirements !== undefined) data.requirements = updateData.requirements;
    if (updateData.weight) data.weight = parseFloat(updateData.weight);
    if (updateData.dimensions) data.dimensions = updateData.dimensions;
    if (updateData.stockQuantity !== undefined) data.stockQuantity = parseInt(updateData.stockQuantity);
    if (updateData.serviceArea) data.serviceArea = updateData.serviceArea;
    if (updateData.duration) data.duration = parseInt(updateData.duration);
    if (updateData.status) data.status = updateData.status;

    const listing = await db.listing.update({
      where: { id },
      data,
    });

    return NextResponse.json({ 
      success: true, 
      listing,
      message: "Listing updated successfully" 
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE - Delete a listing
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    // Check if listing belongs to the seller
    const existingListing = await db.listing.findFirst({
      where: { id, sellerId: session.user.id },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    await db.listing.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: "Listing deleted successfully" 
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
