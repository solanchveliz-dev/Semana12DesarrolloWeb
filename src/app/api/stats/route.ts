import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Activity = {
  id: string;
  type: "book_created" | "book_updated" | "author_created" | "author_updated";
  title: string;
  detail: string;
  date: Date;
  href: string;
};

const wasEdited = (createdAt: Date, updatedAt: Date) => updatedAt.getTime() - createdAt.getTime() > 2000;

// GET /api/stats -> estadísticas generales para el dashboard y la página de estadísticas
export async function GET() {
  try {
    // Las 8 consultas van en paralelo (más rápido). El máximo de conexiones lo pone
    // connection_limit en el .env, así no se llena el pool de Supabase.
    const [totalAuthors, totalBooks, genreRows, pages, recentBooks, recentAuthors, topAuthors, years] = await Promise.all([
      prisma.author.count(),
      prisma.book.count(),
      prisma.book.findMany({ where: { genre: { not: null } }, select: { genre: true } }),
      prisma.book.aggregate({ _avg: { pages: true }, _sum: { pages: true } }),
      prisma.book.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, createdAt: true, updatedAt: true, authorId: true, author: { select: { name: true } } },
      }),
      prisma.author.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      }),
      prisma.author.findMany({
        take: 5,
        orderBy: { books: { _count: "desc" } },
        select: { id: true, name: true, nationality: true, _count: { select: { books: true } } },
      }),
      prisma.book.findMany({ where: { publishedYear: { not: null } }, select: { publishedYear: true } }),
    ]);

    const activity: Activity[] = [
      ...recentBooks.map((b: (typeof recentBooks)[number]) => ({
        id: `b-${b.id}`,
        type: wasEdited(b.createdAt, b.updatedAt) ? ("book_updated" as const) : ("book_created" as const),
        title: b.title,
        detail: b.author.name,
        date: b.updatedAt,
        href: `/authors/${b.authorId}`,
      })),
      ...recentAuthors.map((a: (typeof recentAuthors)[number]) => ({
        id: `a-${a.id}`,
        type: wasEdited(a.createdAt, a.updatedAt) ? ("author_updated" as const) : ("author_created" as const),
        title: a.name,
        detail: "",
        date: a.updatedAt,
        href: `/authors/${a.id}`,
      })),
    ]
      .sort((x: Activity, y: Activity) => y.date.getTime() - x.date.getTime())
      .slice(0, 6);

    // Conteo de libros por género
    const genreCount = new Map<string, number>();
    for (const row of genreRows) {
      if (row.genre) genreCount.set(row.genre, (genreCount.get(row.genre) ?? 0) + 1);
    }
    const genres = [...genreCount.entries()]
      .map(([genre, count]) => ({ genre, count }))
      .sort((x, y) => y.count - x.count);

    const decades = new Map<number, number>();
    for (const { publishedYear } of years) {
      const d = Math.floor((publishedYear ?? 0) / 10) * 10;
      decades.set(d, (decades.get(d) ?? 0) + 1);
    }

    return NextResponse.json({
      totalAuthors,
      totalBooks,
      totalGenres: genres.length,
      averagePages: pages._avg.pages === null ? 0 : Math.round(pages._avg.pages),
      totalPages: pages._sum.pages ?? 0,
      genres,
      topAuthors: topAuthors.map((a: (typeof topAuthors)[number]) => ({ id: a.id, name: a.name, nationality: a.nationality, books: a._count.books })),
      decades: [...decades.entries()].sort((a, b) => a[0] - b[0]).map(([decade, count]) => ({ decade, count })),
      activity,
    });
  } catch (error) {
    return handleError(error);
  }
}