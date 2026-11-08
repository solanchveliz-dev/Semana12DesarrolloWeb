"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, Calendar, ChevronDown, Clock, FileText, Mail, MapPin, Pencil, Plus, Search,
  Tag, Trash2, User, UserPlus, Users, X,
} from "lucide-react";
import { api, Author, GeneralStats, timeAgo } from "@/lib/client";
import { COUNTRIES, USER } from "@/lib/config";
import { BookStack } from "@/components/Illustrations";
import Pager from "@/components/Pager";
import { notify } from "@/components/Toaster";

const emptyForm = { name: "", email: "", bio: "", nationality: "", birthYear: "" };
const PAGE_SIZE = 5;

const activityMeta = {
  book_created: { label: "Libro creado", cls: "t-book", Icon: BookOpen },
  book_updated: { label: "Libro actualizado", cls: "t-edit", Icon: Pencil },
  author_created: { label: "Autor registrado", cls: "t-author", Icon: UserPlus },
  author_updated: { label: "Autor actualizado", cls: "t-edit", Icon: Pencil },
} as const;

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "birthYear" | "books" | "recent">("name");
  const [page, setPage] = useState(1);

  const loadAll = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api<Author[]>("/api/authors"), api<GeneralStats>("/api/stats")]);
      setAuthors(a);
      setStats(s);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? authors.filter((a) => `${a.name} ${a.email} ${a.nationality ?? ""}`.toLowerCase().includes(q))
      : [...authors];
    list.sort((a, b) => {
      if (sortBy === "birthYear") return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
      if (sortBy === "books") return (b._count?.books ?? 0) - (a._count?.books ?? 0);
      if (sortBy === "recent") return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return a.name.localeCompare(b.name, "es");
    });
    return list;
  }, [authors, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  }

  function startEdit(author: Author) {
    setEditingId(author.id);
    setFormError("");
    setForm({
      name: author.name,
      email: author.email,
      bio: author.bio ?? "",
      nationality: author.nationality ?? "",
      birthYear: author.birthYear ? String(author.birthYear) : "",
    });
    document.getElementById("form-autor")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      await loadAll();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(author: Author) {
    const n = author._count?.books ?? 0;
    const extra = n ? ` También se eliminarán sus ${n} libro(s).` : "";
    if (!window.confirm(`¿Eliminar a ${author.name}?${extra}`)) return;
    try {
      await api(`/api/authors/${author.id}`, { method: "DELETE" });
      if (editingId === author.id) resetForm();
      notify("Autor eliminado");
      await loadAll();
    } catch (err) {
      notify((err as Error).message, "error");
    }
  }

  const statCards = [
    { tone: "tone-blue", Icon: BookOpen, value: stats?.totalBooks, label: "Libros registrados" },
    { tone: "tone-teal", Icon: Users, value: stats?.totalAuthors, label: "Autores registrados" },
    { tone: "tone-purple", Icon: Tag, value: stats?.totalGenres, label: "Géneros" },
    { tone: "tone-teal", Icon: FileText, value: stats?.averagePages, label: "Promedio de páginas" },
  ];

  return (
    <>
      <header className="dash-header">
        <div>
          <h1>¡Bienvenida, {USER.firstName}!</h1>
          <p>Administra autores, libros y consulta las estadísticas de tu biblioteca.</p>
        </div>
        <div className="header-tools">
          <button type="button" className="bell" aria-label="Notificaciones">
            <Bell size={24} strokeWidth={1.8} />
          </button>
          <span className="v-sep" />
          <div className="mini-profile">
            <div className="mini-avatar"><User size={24} /></div>
            <div>
              <div className="mini-name">{USER.name}</div>
              <div className="mini-role">{USER.role}</div>
            </div>
            <ChevronDown size={18} />
          </div>
        </div>
      </header>

      {error && <p className="alert error">{error}</p>}

      <section className="stats-grid" id="estadisticas">
        {statCards.map(({ tone, Icon, value, label }) => (
          <article key={label} className={`card stat-card ${tone}`}>
            <div className="stat-icon"><Icon size={32} strokeWidth={1.7} /></div>
            <div>
              <div className="stat-number">
                {value === undefined ? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 30 }} /> : value.toLocaleString("es-PE")}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="dash-row">
        <article className="card author-form-card" id="form-autor">
          <div className="section-title">
            <span className="title-icon">{editingId ? <Pencil size={26} /> : <UserPlus size={28} strokeWidth={1.7} />}</span>
            <h2>{editingId ? "Editar autor" : "Crear nuevo autor"}</h2>
            {editingId && (
              <span className="editing-banner">
                Editando
                <button type="button" onClick={resetForm} aria-label="Cancelar edición" style={{ background: "none", border: 0, padding: 0, display: "inline-flex", color: "inherit" }}>
                  <X size={14} />
                </button>
              </span>
            )}
          </div>

          <div className="author-form-layout">
            <div className="author-form-art"><BookStack variant="light" /></div>

            <form onSubmit={submit}>
              {formError && <p className="alert error">{formError}</p>}
              <div className="author-form-grid">
                <label className="field">
                  <span>Nombre completo<i className="req">*</i></span>
                  <div className="control">
                    <User size={16} />
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Gabriel García Márquez" required />
                  </div>
                </label>
                <label className="field">
                  <span>Email<i className="req">*</i></span>
                  <div className="control">
                    <Mail size={16} />
                    <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Ej. gabo@example.com" required />
                  </div>
                </label>

                <label className="field">
                  <span>Biografía (opcional)</span>
                  <textarea className="textarea" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Breve descripción del autor..." />
                </label>

                <div className="author-form-side">
                  <label className="field">
                    <span>País<i className="req">*</i></span>
                    <div className="control">
                      <MapPin size={16} />
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
                    <div className="control">
                      <Calendar size={16} />
                      <input className="input" type="number" min={0} max={new Date().getFullYear()} value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })} placeholder="Ej. 1927" required />
                    </div>
                  </label>
                  <div className="form-actions span-2" style={{ gridColumn: "span 2" }}>
                    <button type="button" className="btn btn-outline" onClick={resetForm}>
                      {editingId ? "Cancelar" : "Limpiar"}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <span className="spinner sm" /> : editingId ? <Pencil size={16} /> : <Plus size={18} />}
                      {editingId ? "Guardar cambios" : "Crear autor"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </article>

        <article className="card activity-card">
          <div className="section-title">
            <span className="title-icon"><Clock size={26} strokeWidth={1.8} /></span>
            <h2>Actividad reciente</h2>
            <Link href="/estadisticas" className="see-all">Ver todo <ArrowRight size={16} /></Link>
          </div>
          {stats === null ? (
            <p className="empty">Cargando actividad...</p>
          ) : stats.activity.length === 0 ? (
            <p className="empty">Aún no hay actividad. Registra tu primer autor.</p>
          ) : (
            <ul className="activity-list">
              {stats.activity.slice(0, 4).map((item) => {
                const meta = activityMeta[item.type];
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="activity-item">
                      <span className={`activity-icon ${meta.cls}`}><meta.Icon size={19} /></span>
                      <span>
                        <span className="activity-title">{meta.label}</span>
                        <br />
                        <span className="activity-detail">{item.title}</span>
                      </span>
                      <span className="activity-time">{timeAgo(item.date)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>

      <section className="card authors-card" id="autores">
        <div className="authors-head">
          <div className="section-title">
            <span className="title-icon"><Users size={28} strokeWidth={1.7} /></span>
            <h2>Autores registrados</h2>
          </div>
          <div className="authors-tools">
            <div className="control">
              <Search size={17} />
              <input
                className="input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar autor..."
                aria-label="Buscar autor"
              />
            </div>
            <div className="control sort">
              <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} aria-label="Ordenar autores">
                <option value="name">Ordenar por: Nombre</option>
                <option value="birthYear">Ordenar por: Año de nacimiento</option>
                <option value="books">Ordenar por: N.º de libros</option>
                <option value="recent">Ordenar por: Más recientes</option>
              </select>
              <ChevronDown size={16} className="chev" />
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 66 }}>Autor</th>
                <th>Email</th>
                <th>País</th>
                <th>Año de nacimiento</th>
                <th style={{ textAlign: "center" }}>N.º de libros</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><div className="skeleton" style={{ height: 22 }} /></td>
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    {authors.length === 0 ? "Todavía no hay autores registrados. Crea el primero con el formulario." : "No se encontraron autores con esa búsqueda."}
                  </td>
                </tr>
              ) : (
                visible.map((a) => (
                  <tr key={a.id}>
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

        <div className="table-footer">
          <span>Mostrando {visible.length} de {filtered.length} autores</span>
          <Pager page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </>
  );
}
