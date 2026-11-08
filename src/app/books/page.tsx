"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowUpDown, BookOpen, ChevronDown, Pencil, Plus, Search, Tag, Trash2, UserRound } from "lucide-react";
import { api, Author, Book, genreTone, Pagination, SearchResult } from "@/lib/client";
import { OpenBookArt } from "@/components/Illustrations";
import BookCover from "@/components/BookCover";
import BookForm from "@/components/BookForm";
import Pager from "@/components/Pager";
import { notify } from "@/components/Toaster";

const initialPagination: Pagination = { page: 1, limit: 5, total: 0, totalPages: 0, hasNext: false, hasPrev: false };

export default function BooksPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  // Filtros que se envían a /api/books/search
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [genre, setGenre] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sortBy, setSortBy] = useState("publishedYear");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const loadCatalogs = useCallback(async () => {
    try {
      const [a, g] = await Promise.all([api<Author[]>("/api/authors"), api<string[]>("/api/genres")]);
      setAuthors(a);
      setGenres(g);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void loadCatalogs();
    if (window.location.hash === "#buscar") searchRef.current?.focus();
  }, [loadCatalogs]);

  // Búsqueda en tiempo real: espera 350 ms después de la última tecla
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadBooks = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, order });
      if (debounced) params.set("search", debounced);
      if (genre) params.set("genre", genre);
      if (authorName) params.set("authorName", authorName);
      const result = await api<SearchResult>(`/api/books/search?${params}`);
      if (id !== requestId.current) return; // ignora respuestas viejas
      setBooks(result.data);
      setPagination(result.pagination);
      setError("");
      if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) setPage(result.pagination.totalPages);
    } catch (err) {
      if (id === requestId.current) setError((err as Error).message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [debounced, genre, authorName, sortBy, order, page, limit]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  // Cualquier cambio de filtro vuelve a la página 1
  useEffect(() => {
    setPage(1);
  }, [debounced, genre, authorName, sortBy, order, limit]);

  async function remove(book: Book) {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return;
    try {
      await api(`/api/books/${book.id}`, { method: "DELETE" });
      if (editing?.id === book.id) setEditing(null);
      notify("Libro eliminado");
      await Promise.all([loadBooks(), loadCatalogs()]);
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  function openCreate() {
    setEditing(null);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => panelRef.current?.querySelector("input")?.focus(), 300);
  }

  function openEdit(book: Book) {
    setEditing(book);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const genreOptions = [...new Set([...genres, ...(genre ? [genre] : [])])];

  return (
    <>
      <header className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-badge"><BookOpen size={36} strokeWidth={1.8} /></div>
          <div>
            <h1>Catálogo de libros</h1>
            <p>Gestiona, busca y organiza todos los libros de la biblioteca.</p>
          </div>
        </div>
        <div className="catalog-hero-art"><OpenBookArt /></div>
      </header>

      <section className="catalog-sheet">
        <div className="filters-row" id="buscar">
          <div className="search-col">
            <div className="control search-xl">
              <Search size={24} />
              <input
                ref={searchRef}
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                aria-label="Buscar por título"
              />
            </div>
          </div>

          <div>
            <div className="filter-label"><Tag size={17} /> Género</div>
            <div className="control">
              <select className="select" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filtrar por género">
                <option value="">Todos los géneros</option>
                {genreOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>

          <div>
            <div className="filter-label"><UserRound size={17} /> Autor</div>
            <div className="control">
              <select className="select" value={authorName} onChange={(e) => setAuthorName(e.target.value)} aria-label="Filtrar por autor">
                <option value="">Todos los autores</option>
                {authors.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>

          <div>
            <div className="filter-label"><ArrowUpDown size={17} /> Ordenar por</div>
            <div className="control">
              <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Ordenar por">
                <option value="publishedYear">Año de publicación</option>
                <option value="title">Título</option>
                <option value="createdAt">Fecha de creación</option>
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>

          <div>
            <div className="filter-label"><ArrowDownUp size={17} /> Orden</div>
            <div className="control">
              <select className="select" value={order} onChange={(e) => setOrder(e.target.value)} aria-label="Orden">
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>
        </div>

        <div className="catalog-grid">
          <div>
            <div className="results-head">
              <p className="results-copy">
                Resultados:<strong>{pagination.total}</strong>{pagination.total === 1 ? "libro encontrado" : "libros encontrados"}
              </p>
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Plus size={20} /> Crear libro
              </button>
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="books-table-card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Portada</th>
                      <th>Título</th>
                      <th>Autor</th>
                      <th>Género</th>
                      <th>Año</th>
                      <th>Páginas</th>
                      <th style={{ textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={7} className="empty">
                          {debounced || genre || authorName ? "No se encontraron libros con esos filtros." : "Aún no hay libros registrados. Crea el primero con el formulario."}
                        </td>
                      </tr>
                    ) : books.length === 0 ? (
                      Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                        <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 60 }} /></td></tr>
                      ))
                    ) : (
                      books.map((b) => (
                        <tr key={b.id} style={editing?.id === b.id ? { background: "var(--purple-100)" } : undefined}>
                          <td><BookCover title={b.title} coverUrl={b.coverUrl} /></td>
                          <td className="book-title-cell">{b.title}</td>
                          <td>{b.author?.name ?? "—"}</td>
                          <td>{b.genre ? <span className={`pill ${genreTone(b.genre)}`}>{b.genre}</span> : "—"}</td>
                          <td>{b.publishedYear ?? "—"}</td>
                          <td>{b.pages ?? "—"}</td>
                          <td>
                            <div className="actions" style={{ justifyContent: "center" }}>
                              <button type="button" className="icon-btn soft-teal" onClick={() => openEdit(b)} aria-label={`Editar ${b.title}`} title="Editar">
                                <Pencil size={17} />
                              </button>
                              <button type="button" className="icon-btn danger" onClick={() => remove(b)} aria-label={`Eliminar ${b.title}`} title="Eliminar">
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {loading && books.length > 0 && (
                <div className="loading-overlay">
                  <div className="loading-box">
                    <span className="spinner" />
                    Buscando libros...
                  </div>
                </div>
              )}
            </div>

            <div className="table-footer">
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                Mostrar
                <span className="control" style={{ width: 76 }}>
                  <select className="select" value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ height: 36 }}>
                    {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown size={14} className="chev" />
                </span>
                por página
              </label>
              <Pager page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} withText />
            </div>
          </div>

          <div ref={panelRef} style={{ scrollMarginTop: 16 }}>
            <BookForm
              className="card book-panel"
              authors={authors}
              genres={genres}
              editing={editing}
              onSaved={async () => {
                setEditing(null);
                await Promise.all([loadBooks(), loadCatalogs()]);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      </section>
    </>
  );
}
