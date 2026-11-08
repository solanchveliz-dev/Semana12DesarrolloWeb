"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowUp, BarChart3, BookOpen, Calendar, Camera, Check, ChevronDown, ChevronLeft, FileText, Filter,
  Layers, MapPin, Pencil, Plus, Search, Tag, Trash2,
} from "lucide-react";
import { api, Author, AuthorStats, Book, genreTone, Pagination, SearchResult } from "@/lib/client";
import { COUNTRIES } from "@/lib/config";
import BookForm from "@/components/BookForm";
import { fileToDataUrl } from "@/components/ImagePicker";
import Pager from "@/components/Pager";
import { notify } from "@/components/Toaster";

const PAGE_SIZE = 4;

export default function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", bio: "", nationality: "", birthYear: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Lista de libros del autor (usa el endpoint de búsqueda con authorId)
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [booksLoading, setBooksLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<{ by: "title" | "publishedYear"; order: "asc" | "desc" }>({ by: "title", order: "asc" });
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{ open: boolean; book: Book | null }>({ open: false, book: null });
  const photoInput = useRef<HTMLInputElement>(null);

  const fillForm = (a: Author) =>
    setForm({
      name: a.name,
      email: a.email,
      bio: a.bio ?? "",
      nationality: a.nationality ?? "",
      birthYear: a.birthYear ? String(a.birthYear) : "",
    });

  const loadAuthor = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api<Author>(`/api/authors/${id}`), api<AuthorStats>(`/api/authors/${id}/stats`)]);
      setAuthor(a);
      setStats(s);
      fillForm(a);
      setError("");
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("no encontrado")) setNotFound(true);
      else setError(msg);
    }
  }, [id]);

  useEffect(() => {
    void loadAuthor();
  }, [loadAuthor]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, genre, sort]);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const params = new URLSearchParams({ authorId: id, page: String(page), limit: String(PAGE_SIZE), sortBy: sort.by, order: sort.order });
      if (debounced) params.set("search", debounced);
      if (genre) params.set("genre", genre);
      const r = await api<SearchResult>(`/api/books/search?${params}`);
      setBooks(r.data);
      setPagination(r.pagination);
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setBooksLoading(false);
    }
  }, [id, page, sort, debounced, genre]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const refreshAll = () => Promise.all([loadAuthor(), loadBooks()]);

  async function saveAuthor(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api(`/api/authors/${id}`, { method: "PUT", body: JSON.stringify(form) });
      notify("Información del autor actualizada");
      await loadAuthor();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function changePhoto(file?: File) {
    if (!file) return;
    try {
      const photoUrl = await fileToDataUrl(file, 480);
      await api(`/api/authors/${id}`, { method: "PUT", body: JSON.stringify({ photoUrl }) });
      notify("Foto actualizada");
      await loadAuthor();
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  async function removeBook(book: Book) {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return;
    try {
      await api(`/api/books/${book.id}`, { method: "DELETE" });
      notify("Libro eliminado");
      await refreshAll();
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  function toggleSort(by: "title" | "publishedYear") {
    setSort((s) => (s.by === by ? { by, order: s.order === "asc" ? "desc" : "asc" } : { by, order: by === "title" ? "asc" : "desc" }));
  }

  const SortIcon = ({ by }: { by: "title" | "publishedYear" }) =>
    sort.by === by ? (sort.order === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />) : null;

  if (notFound) {
    return (
      <div className="card card-pad" style={{ maxWidth: 520 }}>
        <h1 className="serif" style={{ fontSize: 28 }}>Autor no encontrado</h1>
        <p style={{ margin: "8px 0 18px", color: "var(--muted)" }}>Puede que haya sido eliminado.</p>
        <Link href="/" className="btn btn-primary">Volver a Autores</Link>
      </div>
    );
  }

  const start = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <>
      <div className="detail-top">
      <Link href="/authors" className="back-link">
          <span className="icon-btn"><ChevronLeft size={20} /></span>
          Volver a Autores
        </Link>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setModal({ open: true, book: null })} disabled={!author}>
          <Plus size={22} /> Agregar nuevo libro
        </button>
      </div>

      {error && <p className="alert error">{error}</p>}

      <section className="detail-hero">
        <div className="author-photo">
          {author?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.photoUrl} alt={`Foto de ${author.name}`} />
          ) : (
            <span className="monogram">
              {author ? author.name.split(" ").map((p) => p[0]).slice(0, 2).join("") : ""}
            </span>
          )}
          <button type="button" className="photo-change" onClick={() => photoInput.current?.click()} disabled={!author}>
            <Camera size={16} /> {author?.photoUrl ? "Cambiar foto" : "Subir foto"}
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              void changePhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="author-summary">
          <span className="tag">Autor</span>
          {author ? (
            <>
              <h1>{author.name}</h1>
              <div className="author-meta">
                <span><Calendar size={20} /> Nacimiento: {author.birthYear ?? "—"}</span>
                <span className="dot-sep" />
                <span><MapPin size={20} /> Nacionalidad: {author.nationality ?? "—"}</span>
              </div>
              <div className="bio-title"><BookOpen size={22} /> Biografía</div>
              <p className="bio-text">{author.bio || "Este autor aún no tiene biografía registrada."}</p>
            </>
          ) : (
            <>
              <div className="skeleton" style={{ height: 44, width: "70%", margin: "14px 0" }} />
              <div className="skeleton" style={{ height: 18, width: "50%", marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 60 }} />
            </>
          )}
        </div>

        <article className="card edit-card">
          <div className="head">
            <Pencil size={22} />
            <h2>Editar información del autor</h2>
          </div>
          {formError && <p className="alert error">{formError}</p>}
          <form onSubmit={saveAuthor}>
            <div className="grid-2">
              <label className="field">
                <span>Nombre completo<i className="req">*</i></span>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="field">
                <span>Nacionalidad<i className="req">*</i></span>
                <div className="control">
                  <select className="select" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    {[...new Set([...COUNTRIES, ...(form.nationality ? [form.nationality] : [])])].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="chev" />
                </div>
              </label>
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Correo electrónico</span>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="field">
                <span>Año de nacimiento<i className="req">*</i></span>
                <input className="input" type="number" min={0} max={new Date().getFullYear()} value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })} required />
              </label>
            </div>
            <label className="field">
              <span>Biografía</span>
              <textarea className="textarea" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-sm" style={{ height: 38 }} onClick={() => author && fillForm(author)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ height: 38 }} disabled={saving || !author}>
                {saving ? <span className="spinner sm" /> : <Check size={17} />} Guardar cambios
              </button>
            </div>
          </form>
        </article>
      </section>

      <div className="stats-title">
        <BarChart3 size={26} />
        <h2>Estadísticas del autor</h2>
      </div>

      <section className="astats-row1">
        <div className="astat dark">
          <span className="ico"><BookOpen size={32} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-big">{stats?.totalBooks ?? "—"}</div>
            <div className="astat-label">Libros publicados</div>
          </div>
        </div>
        <div className="card astat">
          <span className="ico plain"><Calendar size={36} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-label">Primer libro</div>
            <div className="astat-value">{stats?.firstBook?.title ?? "Sin datos"}</div>
            {stats?.firstBook && <div className="astat-sub">Año: {stats.firstBook.year}</div>}
          </div>
        </div>
        <div className="card astat">
          <span className="ico plain"><Calendar size={36} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-label">Último libro</div>
            <div className="astat-value">{stats?.latestBook?.title ?? "Sin datos"}</div>
            {stats?.latestBook && <div className="astat-sub">Año: {stats.latestBook.year}</div>}
          </div>
        </div>
        <div className="card astat">
          <span className="ico plain"><Layers size={36} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-label">Promedio de páginas</div>
            <div className="astat-big">{stats ? stats.averagePages : "—"}</div>
          </div>
        </div>
      </section>

      <section className="astats-row2">
        <div className="card astat">
          <span className="ico"><Tag size={28} /></span>
          <div>
            <div className="astat-label">Géneros únicos</div>
            <div className="genre-pills">
              {stats?.genres.length ? (
                stats.genres.map((g) => <span key={g} className={`pill ${genreTone(g)}`}>{g}</span>)
              ) : (
                <span className="astat-sub">Sin géneros registrados</span>
              )}
            </div>
          </div>
        </div>
        <div className="card astat mint">
          <span className="ico"><BookOpen size={36} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-label">Libro con más páginas</div>
            <div className="astat-value">{stats?.longestBook?.title ?? "Sin datos"}</div>
            {stats?.longestBook && <div className="astat-sub">{stats.longestBook.pages} páginas</div>}
          </div>
        </div>
        <div className="card astat lilac">
          <span className="ico"><BookOpen size={36} strokeWidth={1.6} /></span>
          <div>
            <div className="astat-label">Libro con menos páginas</div>
            <div className="astat-value">{stats?.shortestBook?.title ?? "Sin datos"}</div>
            {stats?.shortestBook && <div className="astat-sub">{stats.shortestBook.pages} páginas</div>}
          </div>
        </div>
      </section>

      <section>
        <div className="author-books-head">
          <div className="left">
            <BookOpen size={26} color="var(--ink)" />
            <h2>Libros del autor</h2>
            <span className="count-chip">{stats?.totalBooks ?? 0} libros</span>
          </div>
          <div className="tools">
            <div className="control">
              <Search size={16} />
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar libro..." aria-label="Buscar libro del autor" />
            </div>
            <div className="control genre">
              <Filter size={16} />
              <select className="select" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filtrar por género">
                <option value="">Filtrar por género</option>
                {stats?.genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={16} className="chev" />
            </div>
          </div>
        </div>

        <div className="author-books-table">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 28 }}>
                    <button type="button" className="th-sort" onClick={() => toggleSort("title")}>Título <SortIcon by="title" /></button>
                  </th>
                  <th>Género</th>
                  <th>
                    <button type="button" className="th-sort" onClick={() => toggleSort("publishedYear")}>Año <SortIcon by="publishedYear" /></button>
                  </th>
                  <th>Páginas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {booksLoading && books.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 22 }} /></td></tr>
                  ))
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      {debounced || genre ? "Ningún libro coincide con la búsqueda." : "Este autor aún no tiene libros. Usa “Agregar nuevo libro”."}
                    </td>
                  </tr>
                ) : (
                  books.map((b) => (
                    <tr key={b.id} style={{ opacity: booksLoading ? 0.55 : 1 }}>
                      <td style={{ paddingLeft: 28 }}>
                        <span className="doc-cell"><FileText size={20} strokeWidth={1.6} /> {b.title}</span>
                      </td>
                      <td>{b.genre ? <span className={`pill ${genreTone(b.genre)}`}>{b.genre}</span> : "—"}</td>
                      <td>{b.publishedYear ?? "—"}</td>
                      <td>{b.pages ?? "—"}</td>
                      <td>
                        <div className="actions">
                          <button type="button" className="btn-ghost-teal" onClick={() => setModal({ open: true, book: b })}>
                            <Pencil size={15} /> Editar
                          </button>
                          <button type="button" className="btn-ghost-red" onClick={() => removeBook(b)}>
                            <Trash2 size={15} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-footer">
          <span>Mostrando {start} – {end} de {pagination?.total ?? 0} libros</span>
          {pagination && <Pager page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />}
        </div>
      </section>

      {modal.open && author && (
        <div className="modal-backdrop" onClick={() => setModal({ open: false, book: null })}>
          <div className="card book-panel modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <BookForm
              authors={[{ id: author.id, name: author.name }]}
              genres={stats?.genres}
              editing={modal.book}
              fixedAuthorId={author.id}
              onSaved={async () => {
                setModal({ open: false, book: null });
                await refreshAll();
              }}
              onCancel={() => setModal({ open: false, book: null })}
            />
          </div>
        </div>
      )}
    </>
  );
}
