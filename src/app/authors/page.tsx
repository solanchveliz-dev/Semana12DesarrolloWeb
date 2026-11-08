"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, ChevronDown, Pencil, Plus, Search, Trash2, User, UserPlus, Users } from "lucide-react";
import { api, Author } from "@/lib/client";
import { COUNTRIES } from "@/lib/config";
import { OpenBookArt } from "@/components/Illustrations";
import Pager from "@/components/Pager";
import { notify } from "@/components/Toaster";

const emptyForm = { name: "", email: "", bio: "", nationality: "", birthYear: "" };
const PAGE_SIZE = 8;

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "birthYear" | "books" | "recent">("name");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      setAuthors(await api<Author[]>("/api/authors"));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countries = useMemo(
    () => [...new Set(authors.map((a) => a.nationality).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, "es")),
    [authors],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = authors.filter(
      (a) => (!q || `${a.name} ${a.email}`.toLowerCase().includes(q)) && (!country || a.nationality === country),
    );
    list.sort((a, b) => {
      if (sortBy === "birthYear") return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
      if (sortBy === "books") return (b._count?.books ?? 0) - (a._count?.books ?? 0);
      if (sortBy === "recent") return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return a.name.localeCompare(b.name, "es");
    });
    return list;
  }, [authors, search, country, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  }

  function startEdit(a: Author) {
    setEditingId(a.id);
    setFormError("");
    setForm({
      name: a.name,
      email: a.email,
      bio: a.bio ?? "",
      nationality: a.nationality ?? "",
      birthYear: a.birthYear ? String(a.birthYear) : "",
    });
    document.getElementById("panel-autor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const body = JSON.stringify(form);
      if (editingId) {
        await api(`/api/authors/${editingId}`, { method: "PUT", body });
        notify("Autor actualizado correctamente");
      } else {
        await api("/api/authors", { method: "POST", body });
        notify("Autor registrado correctamente");
      }
      resetForm();
      await load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: Author) {
    const n = a._count?.books ?? 0;
    const extra = n ? ` También se eliminarán sus ${n} libro(s).` : "";
    if (!window.confirm(`¿Eliminar a ${a.name}?${extra}`)) return;
    try {
      await api(`/api/authors/${a.id}`, { method: "DELETE" });
      if (editingId === a.id) resetForm();
      notify("Autor eliminado");
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  return (
    <>
      <header className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-badge"><Users size={36} strokeWidth={1.8} /></div>
          <div>
            <h1>Autores</h1>
            <p>Registra, edita y consulta los autores de la biblioteca.</p>
          </div>
        </div>
        <div className="catalog-hero-art"><OpenBookArt /></div>
      </header>

      <section className="catalog-sheet">
        <div className="filters-row" style={{ gridTemplateColumns: "minmax(240px, 1.6fr) repeat(2, minmax(160px, 1fr))" }}>
          <div className="search-col">
            <div className="control search-xl">
              <Search size={24} />
              <input
                className="input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre o email..."
                aria-label="Buscar autor"
              />
            </div>
          </div>
          <div>
            <div className="filter-label">País</div>
            <div className="control">
              <select
                className="select"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                aria-label="Filtrar por país"
              >
                <option value="">Todos los países</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>
          <div>
            <div className="filter-label">Ordenar por</div>
            <div className="control">
              <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} aria-label="Ordenar autores">
                <option value="name">Nombre</option>
                <option value="birthYear">Año de nacimiento</option>
                <option value="books">N.º de libros</option>
                <option value="recent">Más recientes</option>
              </select>
              <ChevronDown size={18} className="chev" />
            </div>
          </div>
        </div>

        <div className="catalog-grid">
          <div>
            <div className="results-head">
              <p className="results-copy">
                Resultados:<strong>{filtered.length}</strong>{filtered.length === 1 ? "autor encontrado" : "autores encontrados"}
              </p>
              <button type="button" className="btn btn-primary" onClick={() => { resetForm(); document.getElementById("panel-autor")?.scrollIntoView({ behavior: "smooth" }); }}>
                <Plus size={20} /> Crear autor
              </button>
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="books-table-card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 66 }}>Autor</th>
                      <th>Email</th>
                      <th>País</th>
                      <th>Nacimiento</th>
                      <th style={{ textAlign: "center" }}>Libros</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 24 }} /></td></tr>
                      ))
                    ) : visible.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty">
                          {authors.length === 0 ? "Todavía no hay autores registrados. Crea el primero con el formulario." : "No se encontraron autores con esos filtros."}
                        </td>
                      </tr>
                    ) : (
                      visible.map((a) => (
                        <tr key={a.id} style={editingId === a.id ? { background: "var(--purple-100)" } : undefined}>
                          <td>
                            <div className="cell-author">
                              <span className="avatar">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {a.photoUrl ? <img src={a.photoUrl} alt="" /> : <User size={18} />}
                              </span>
                              {a.name}
                            </div>
                          </td>
                          <td>{a.email}</td>
                          <td>{a.nationality ?? "—"}</td>
                          <td>{a.birthYear ?? "—"}</td>
                          <td style={{ textAlign: "center" }}><span className="count-pill">{a._count?.books ?? 0}</span></td>
                          <td>
                            <div className="actions">
                              <Link href={`/authors/${a.id}`} className="btn-teal-solid"><BookOpen size={16} /> Ver libros</Link>
                              <button type="button" className="icon-btn" onClick={() => startEdit(a)} aria-label={`Editar ${a.name}`} title="Editar">
                                <Pencil size={16} />
                              </button>
                              <button type="button" className="icon-btn danger" onClick={() => remove(a)} aria-label={`Eliminar ${a.name}`} title="Eliminar">
                                <Trash2 size={16} />
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
              <span>Mostrando {visible.length} de {filtered.length} autores</span>
              <Pager page={safePage} totalPages={totalPages} onChange={setPage} withText />
            </div>
          </div>

          <div id="panel-autor" style={{ scrollMarginTop: 16 }}>
            <div className="card book-panel">
              <div className="book-panel-head">
                <span className={`round-plus${editingId ? " edit" : ""}`}>{editingId ? <Pencil size={18} /> : <UserPlus size={20} />}</span>
                <div>
                  <h3>{editingId ? "Editar autor" : "Crear autor"}</h3>
                  <p>{editingId ? "Actualiza los datos del autor seleccionado." : "Registra un nuevo autor en la biblioteca."}</p>
                </div>
              </div>

              {formError && <p className="alert error">{formError}</p>}

              <form className="book-form" onSubmit={submit}>
                <label className="field">
                  <span>Nombre completo<i className="req">*</i></span>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Gabriel García Márquez" required />
                </label>
                <label className="field">
                  <span>Email<i className="req">*</i></span>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Ej. gabo@example.com" required />
                </label>
                <div className="grid-2">
                  <label className="field">
                    <span>País<i className="req">*</i></span>
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
                  <label className="field">
                    <span>Año de nacimiento<i className="req">*</i></span>
                    <input className="input" type="number" min={0} max={new Date().getFullYear()} value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })} placeholder="Ej. 1927" required />
                  </label>
                </div>
                <label className="field">
                  <span>Biografía (opcional)</span>
                  <textarea className="textarea" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Breve descripción del autor..." />
                </label>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    {editingId ? "Cancelar" : "Limpiar"}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner sm" /> : <Check size={18} />}
                    {editingId ? "Guardar cambios" : "Crear autor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}