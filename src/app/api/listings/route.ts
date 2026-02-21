import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/listings - Get all listings with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sellerId = searchParams.get("sellerId");

    const where: any = {
      status: "ACTIVE",
    };

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { viewCount: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
    }

    const total = await db.listing.count({ where });

    const listings = await db.listing.findMany({
      where,
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Parse JSON fields
    const parsedListings = listings.map((listing) => ({
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      tags: listing.tags ? JSON.parse(listing.tags) : [],
      shippingOptions: listing.shippingOptions
        ? JSON.parse(listing.shippingOptions)
        : null,
      dimensions: listing.dimensions
        ? JSON.parse(listing.dimensions)
        : null,
    }));

    return NextResponse.json({
      listings: parsedListings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
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
      type,
      category,
      subcategory,
      tags,
      images,
      thumbnail,
      // Digital
      portfolioUrl,
      deliveryTime,
      revisions,
      requirements,
      // Physical
      weight,
      dimensions,
      shippingOptions,
      stockQuantity,
      sku,
      // Service
      serviceArea,
      availability,
      duration,
      status = "DRAFT",
    } = body;

    if (!title || !description || !price || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await db.listing.create({
      data: {
        sellerId: session.user.id,
        title,
        description,
        price: parseFloat(price),
        type: type as any,
        category,
        subcategory,
        tags: tags ? JSON.stringify(tags) : null,
        images: images ? JSON.stringify(images) : null,
        thumbnail,
        portfolioUrl,
        deliveryTime: deliveryTime ? parseInt(deliveryTime) : null,
        revisions: revisions ? parseInt(revisions) : null,
        requirements,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        shippingOptions: shippingOptions ? JSON.stringify(shippingOptions) : null,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : null,
        sku,
        serviceArea,
        availability,
        duration: duration ? parseInt(duration) : null,
        status,
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
