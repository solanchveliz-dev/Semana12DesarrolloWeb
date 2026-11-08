export type Author = {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  nationality: string | null;
  birthYear: number | null;
  photoUrl?: string | null;
  createdAt?: string;
  books?: Book[];
  _count?: { books: number };
};

export type Book = {
  id: string;
  title: string;
  isbn: string;
  description: string | null;
  genre: string | null;
  pages: number | null;
  publishedYear: number | null;
  coverUrl?: string | null;
  authorId: string;
  createdAt?: string;
  author?: { id: string; name: string; email: string };
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type SearchResult = { data: Book[]; pagination: Pagination };

export type AuthorStats = {
  authorId: string;
  authorName: string;
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number;
  genres: string[];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
};

export type GeneralStats = {
  totalAuthors: number;
  totalBooks: number;
  totalGenres: number;
  averagePages: number;
  totalPages: number;
  genres: { genre: string; count: number }[];
  topAuthors: { id: string; name: string; nationality: string | null; books: number }[];
  decades: { decade: number; count: number }[];
  activity: {
    id: string;
    type: "book_created" | "book_updated" | "author_created" | "author_updated";
    title: string;
    detail: string;
    date: string;
    href: string;
  }[];
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    cache: "no-store",
  });
  let result: unknown = null;
  try {
    result = await response.json();
  } catch {
    /* respuesta vacía */
  }
  if (!response.ok) {
    const message = (result as { error?: string } | null)?.error ?? `Error ${response.status} en la solicitud`;
    throw new Error(message);
  }
  return result as T;
}

export function timeAgo(dateLike: string | Date) {
  const diff = Math.max(0, Date.now() - new Date(dateLike).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Hace un momento";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Hace ${d} d`;
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(dateLike));
}

// Asigna un color estable a cada género (para los "pills")
export function genreTone(genre: string | null | undefined) {
  if (!genre) return "";
  const known: Record<string, string> = { Novela: "", Fábula: "g-1", Cuento: "", Periodismo: "", Poesía: "g-2", Distopía: "g-4", Memorias: "g-3", Ensayo: "g-5" };
  if (genre in known) return known[genre];
  let h = 0;
  for (const c of genre) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `g-${(h % 5) + 1}`;
}
