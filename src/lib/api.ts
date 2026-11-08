import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export class ValidationError extends Error {}

export function handleError(error: unknown) {
  if (error instanceof ValidationError) return fail(error.message, 400);
  if (error instanceof SyntaxError) return fail("JSON inválido", 400);
  console.error(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail("El valor único (email o ISBN) ya está registrado", 409);
    if (error.code === "P2025") return fail("Registro no encontrado", 404);
    if (error.code === "P2003") return fail("Referencia inválida", 400);
  }
  return fail("Error interno del servidor", 500);
}

export function year(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 3000) throw new ValidationError("Año inválido");
  return n;
}

export function positiveInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new ValidationError("Las páginas deben ser un entero positivo");
  return n;
}

// Acepta una imagen en base64 (data URL) o un enlace http(s). Máximo ~600 KB.
export function imageField(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") throw new ValidationError("Imagen inválida");
  const isData = /^data:image\/(png|jpe?g|webp);base64,/.test(value);
  const isUrl = /^https?:\/\//.test(value);
  if (!isData && !isUrl) throw new ValidationError("Formato de imagen no permitido (PNG, JPG o WEBP)");
  if (value.length > 800_000) throw new ValidationError("La imagen es demasiado pesada");
  return value;
}

export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const generateIsbn = () =>
  `978-${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 10)}`;
