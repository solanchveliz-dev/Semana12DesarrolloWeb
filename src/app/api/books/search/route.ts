import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["title", "publishedYear", "createdAt"] as const;
type SortField = (typeof SORT_FIELDS)[number];

function toInt(value: string | null, fallback: number) {
  const n = Number(value);
  return value !== null && Number.isInteger(n) && n > 0 ? n : fallback;
}

// GET /api/books/search?search=amor&genre=Novela&authorName=garcia&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;

    const search = q.get("search")?.trim() || "";
    const genre = q.get("genre")?.trim() || "";
    const authorName = q.get("authorName")?.trim() || "";
    const authorId = q.get("authorId")?.trim() || ""; // opcional (lo usa la página del autor)

    const page = toInt(q.get("page"), 1);
    const limit = Math.min(toInt(q.get("limit"), 10), 50);

    const sortParam = q.get("sortBy") ?? "";
    const sortBy: SortField = (SORT_FIELDS as readonly string[]).includes(sortParam) ? (sortParam as SortField) : "createdAt";
    const order: Prisma.SortOrder = q.get("order") === "asc" ? "asc" : "desc";

    const where: Prisma.BookWhereInput = {
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(genre ? { genre } : {}),
      ...(authorId ? { authorId } : {}),
      ...(authorName ? { author: { name: { contains: authorName, mode: "insensitive" } } } : {}),
    };

    const orderBy: Prisma.BookOrderByWithRelationInput[] =
      sortBy === "publishedYear"
        ? [{ publishedYear: { sort: order, nulls: "last" } }, { title: "asc" }]
        : [{ [sortBy]: order }];

    const [total, data] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
