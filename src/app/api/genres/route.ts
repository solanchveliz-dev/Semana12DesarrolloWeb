import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/genres -> ["Cuento", "Novela", ...] (géneros disponibles en la base de datos)
export async function GET() {
  try {
    const rows = await prisma.book.findMany({
      where: { genre: { not: null } },
      distinct: ["genre"],
      select: { genre: true },
      orderBy: { genre: "asc" },
    });
    return NextResponse.json(rows.map((r) => r.genre));
  } catch (e) {
    return handleError(e);
  }
}
