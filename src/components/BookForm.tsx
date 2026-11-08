"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Pencil, Plus } from "lucide-react";
import { api, Author, Book } from "@/lib/client";
import { BASE_GENRES } from "@/lib/config";
import ImagePicker from "./ImagePicker";
import { notify } from "./Toaster";

const empty = { title: "", authorId: "", genre: "", publishedYear: "", pages: "", coverUrl: "" };

type Props = {
  authors: Pick<Author, "id" | "name">[];
  genres?: string[];
  editing?: Book | null; // si viene un libro, el formulario pasa a modo edición
  fixedAuthorId?: string; // en la página del autor, el autor ya viene seleccionado
  onSaved: (book: Book) => void;
  onCancel?: () => void;
  className?: string;
};

export default function BookForm({ authors, genres = [], editing, fixedAuthorId, onSaved, onCancel, className = "" }: Props) {
  const [form, setForm] = useState({ ...empty, authorId: fixedAuthorId ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (editing) {
      setForm({
        title: editing.title,
        authorId: editing.authorId,
        genre: editing.genre ?? "",
        publishedYear: editing.publishedYear ? String(editing.publishedYear) : "",
        pages: editing.pages ? String(editing.pages) : "",
        coverUrl: editing.coverUrl ?? "",
      });
    } else {
      setForm({ ...empty, authorId: fixedAuthorId ?? "" });
    }
  }, [editing, fixedAuthorId]);

  const genreOptions = useMemo(
    () => [...new Set([...genres, ...BASE_GENRES, ...(form.genre ? [form.genre] : [])])].sort((a, b) => a.localeCompare(b, "es")),
    [genres, form.genre],
  );

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = JSON.stringify({
        title: form.title,
        authorId: form.authorId,
        genre: form.genre,
        publishedYear: form.publishedYear,
        pages: form.pages,
        coverUrl: form.coverUrl,
      });
      const book = editing
        ? await api<Book>(`/api/books/${editing.id}`, { method: "PUT", body })
        : await api<Book>("/api/books", { method: "POST", body });
      notify(editing ? "Libro actualizado correctamente" : "Libro creado correctamente");
      if (!editing) setForm({ ...empty, authorId: fixedAuthorId ?? "" });
      onSaved(book);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className={className}>
      <div className="book-panel-head">
        <span className={`round-plus${editing ? " edit" : ""}`}>{editing ? <Pencil size={18} /> : <Plus size={22} />}</span>
        <div>
          <h3>{editing ? "Editar libro" : "Crear libro"}</h3>
          <p>{editing ? "Actualiza los datos del libro seleccionado." : "Registra un nuevo libro en la biblioteca."}</p>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}

      <form className="book-form" onSubmit={submit}>
        <label className="field">
          <span>Título<i className="req">*</i></span>
          <input className="input" value={form.title} onChange={set("title")} placeholder="Ej. Cien años de soledad" required />
        </label>

        <label className="field">
          <span>Autor<i className="req">*</i></span>
          <div className="control">
            <select className="select" value={form.authorId} onChange={set("authorId")} required disabled={Boolean(fixedAuthorId)}>
              <option value="">Selecciona un autor</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="chev" />
          </div>
        </label>

        <div className="grid-2">
          <label className="field">
            <span>Género<i className="req">*</i></span>
            <div className="control">
              <select className="select" value={form.genre} onChange={set("genre")} required>
                <option value="">Selecciona un género</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown size={16} className="chev" />
            </div>
          </label>
          <label className="field">
            <span>Año de publicación<i className="req">*</i></span>
            <input className="input" type="number" min={0} max={currentYear} value={form.publishedYear} onChange={set("publishedYear")} placeholder={String(currentYear)} required />
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Páginas<i className="req">*</i></span>
            <input className="input" type="number" min={1} value={form.pages} onChange={set("pages")} placeholder="Ej. 417" required />
          </label>
        </div>

        <div className="field">
          <span className="field-label">Portada</span>
          <ImagePicker value={form.coverUrl} onChange={(coverUrl) => setForm((f) => ({ ...f, coverUrl }))} />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setForm({ ...empty, authorId: fixedAuthorId ?? "" });
              setError("");
              onCancel?.();
            }}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner sm" /> : <Check size={18} />}
            {editing ? "Guardar cambios" : "Guardar libro"}
          </button>
        </div>
      </form>
    </div>
  );
}
