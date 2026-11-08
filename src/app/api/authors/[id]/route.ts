import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handleError, imageField, validEmail, year } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: { orderBy: { publishedYear: "desc" } }, _count: { select: { books: true } } },
    });
    return author ? NextResponse.json(author) : fail("Autor no encontrado", 404);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) return fail("Nombre inválido");
    if (body.email !== undefined && (typeof body.email !== "string" || !validEmail(body.email.trim()))) return fail("Email inválido");

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() } : {}),
        ...(body.bio !== undefined ? { bio: body.bio?.trim() || null } : {}),
        ...(body.nationality !== undefined ? { nationality: body.nationality || null } : {}),
        ...(body.birthYear !== undefined ? { birthYear: year(body.birthYear) } : {}),
        ...(body.photoUrl !== undefined ? { photoUrl: imageField(body.photoUrl) } : {}),
      },
    });
    return NextResponse.json(author);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ message: "Autor eliminado correctamente" });
  } catch (e) {
    return handleError(e);
  }
}
