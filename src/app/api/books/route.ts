import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, generateIsbn, handleError, imageField, positiveInt, year } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const authorId = searchParams.get("authorId");
    const books = await prisma.book.findMany({
      where: { ...(genre ? { genre } : {}), ...(authorId ? { authorId } : {}) },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.title !== "string" || body.title.trim().length < 1) return fail("El título es requerido");
    if (typeof body.authorId !== "string" || !body.authorId) return fail("Selecciona un autor");
    if (!(await prisma.author.findUnique({ where: { id: body.authorId } }))) return fail("El autor especificado no existe", 404);

    const isbn = typeof body.isbn === "string" && body.isbn.trim() ? body.isbn.trim() : generateIsbn();

    const book = await prisma.book.create({
      data: {
        title: body.title.trim(),
        authorId: body.authorId,
        isbn,
        description: body.description?.trim() || null,
        genre: body.genre || null,
        publishedYear: year(body.publishedYear),
        pages: positiveInt(body.pages),
        coverUrl: imageField(body.coverUrl),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
