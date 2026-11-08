"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Clock, FileText, Pencil, Tag, Trophy, UserPlus, Users } from "lucide-react";
import { api, GeneralStats, timeAgo } from "@/lib/client";

function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="empty">Sin datos todavía.</p>;
  return (
    <ul className="bar-list">
      {rows.map((r) => (
        <li key={r.label} className="bar-row" title={`${r.label}: ${r.value} libro(s)`}>
          <span className="label">{r.label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(r.value / max) * 100}%`, display: "block" }} />
          </span>
          <span className="val">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

const icons = { book_created: BookOpen, book_updated: Pencil, author_created: UserPlus, author_updated: Pencil };
const labels = { book_created: "Libro creado", book_updated: "Libro actualizado", author_created: "Autor registrado", author_updated: "Autor actualizado" };

export default function EstadisticasPage() {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<GeneralStats>("/api/stats").then(setStats).catch((e) => setError((e as Error).message));
  }, []);

  const cards = [
    { tone: "tone-blue", Icon: BookOpen, value: stats?.totalBooks, label: "Libros registrados" },
    { tone: "tone-teal", Icon: Users, value: stats?.totalAuthors, label: "Autores registrados" },
    { tone: "tone-purple", Icon: Tag, value: stats?.totalGenres, label: "Géneros" },
    { tone: "tone-teal", Icon: FileText, value: stats?.totalPages, label: "Páginas en total" },
  ];

  return (
    <>
      <header className="page-title">
        <h1>Estadísticas generales</h1>
        <p>Resumen de la colección calculado en tiempo real desde la base de datos.</p>
      </header>

      {error && <p className="alert error">{error}</p>}

      <section className="stats-grid">
        {cards.map(({ tone, Icon, value, label }) => (
          <article key={label} className={`card stat-card ${tone}`}>
            <div className="stat-icon"><Icon size={32} strokeWidth={1.7} /></div>
            <div>
              <div className="stat-number">{value === undefined ? "—" : value.toLocaleString("es-PE")}</div>
              <div className="stat-label">{label}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="stats-panels">
        <article className="card card-pad">
          <div className="section-title"><Tag size={24} /><h2>Libros por género</h2></div>
          {stats && <BarList rows={stats.genres.map((g) => ({ label: g.genre, value: g.count }))} />}
        </article>

        <article className="card card-pad">
          <div className="section-title"><Trophy size={24} /><h2>Autores con más libros</h2></div>
          {stats && (
            <ul className="rank-list">
              {stats.topAuthors.map((a, i) => (
                <li key={a.id}>
                  <span className="rank-num">{i + 1}</span>
                  <Link href={`/authors/${a.id}`} style={{ flex: 1, fontWeight: 600, color: "var(--ink)" }}>{a.name}</Link>
                  <span style={{ color: "var(--muted)" }}>{a.nationality ?? ""}</span>
                  <span className="count-pill">{a.books}</span>
                </li>
              ))}
              {stats.topAuthors.length === 0 && <p className="empty">Sin autores todavía.</p>}
            </ul>
          )}
        </article>

        <article className="card card-pad">
          <div className="section-title"><BookOpen size={24} /><h2>Libros por década de publicación</h2></div>
          {stats && <BarList rows={stats.decades.map((d) => ({ label: `${d.decade}s`, value: d.count }))} />}
        </article>

        <article className="card card-pad">
          <div className="section-title"><Clock size={24} /><h2>Actividad reciente</h2></div>
          {stats && (
            <ul className="activity-list" style={{ marginTop: 8 }}>
              {stats.activity.map((item) => {
                const Icon = icons[item.type];
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="activity-item">
                      <span className={`activity-icon ${item.type.endsWith("updated") ? "t-edit" : "t-book"}`}><Icon size={18} /></span>
                      <span>
                        <span className="activity-title">{labels[item.type]}</span>
                        <br />
                        <span className="activity-detail">{item.title}{item.detail ? ` · ${item.detail}` : ""}</span>
                      </span>
                      <span className="activity-time">{timeAgo(item.date)}</span>
                    </Link>
                  </li>
                );
              })}
              {stats.activity.length === 0 && <p className="empty">Sin actividad todavía.</p>}
            </ul>
          )}
        </article>
      </section>
    </>
  );
}
