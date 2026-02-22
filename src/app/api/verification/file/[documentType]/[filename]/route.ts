import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// GET /api/verification/file/[documentType]/[filename] - Serve secure verification files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentType: string; filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only authenticated users can access
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentType, filename } = await params;

    // Validate document type
    if (!["id_document", "shop_photo"].includes(documentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    // Build file path
    const filepath = path.join(process.cwd(), "uploads", "verification", documentType, filename);

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Security check: Only allow access to:
    // 1. Admin users (full access)
    // 2. The owner of the document (based on filename prefix)
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = filename.startsWith(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Read and serve file
    const fileBuffer = await readFile(filepath);
    const fileStat = await stat(filepath);

    // Determine content type
    const extension = filename.split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
    };
    const contentType = contentTypes[extension || ""] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Serve verification file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
