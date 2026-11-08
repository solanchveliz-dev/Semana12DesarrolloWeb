import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handleError } from "@/lib/api";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!author) return fail("Autor no encontrado", 404);
    const books = await prisma.book.findMany({ where: { authorId: id }, orderBy: { publishedYear: "desc" } });
    return NextResponse.json({ author, totalBooks: books.length, books });
  } catch (e) { return handleError(e); }
}
