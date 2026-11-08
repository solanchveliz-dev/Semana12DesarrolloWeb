import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handleError, imageField, positiveInt, year } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({ where: { id }, include: { author: true } });
    return book ? NextResponse.json(book) : fail("Libro no encontrado", 404);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) return fail("Título inválido");
    if (body.isbn !== undefined && body.isbn !== "" && typeof body.isbn !== "string") return fail("ISBN inválido");
    if (body.authorId !== undefined && !(await prisma.author.findUnique({ where: { id: body.authorId } })))
      return fail("El autor especificado no existe", 404);

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(typeof body.isbn === "string" && body.isbn.trim() ? { isbn: body.isbn.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
        ...(body.genre !== undefined ? { genre: body.genre || null } : {}),
        ...(body.authorId !== undefined ? { authorId: body.authorId } : {}),
        ...(body.publishedYear !== undefined ? { publishedYear: year(body.publishedYear) } : {}),
        ...(body.pages !== undefined ? { pages: positiveInt(body.pages) } : {}),
        ...(body.coverUrl !== undefined ? { coverUrl: imageField(body.coverUrl) } : {}),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(book);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ message: "Libro eliminado correctamente" });
  } catch (e) {
    return handleError(e);
  }
}
