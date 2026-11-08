import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handleError, imageField, validEmail, year } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        nationality: true,
        birthYear: true,
        photoUrl: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(authors);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim()) return fail("El nombre es requerido");
    if (typeof body.email !== "string" || !validEmail(body.email.trim())) return fail("Ingresa un email válido");

    const author = await prisma.author.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        bio: body.bio?.trim() || null,
        nationality: body.nationality || null,
        birthYear: year(body.birthYear),
        photoUrl: imageField(body.photoUrl),
      },
    });
    return NextResponse.json(author, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
