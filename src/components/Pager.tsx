"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(page - 2, total - 4));
  const pages: (number | "…")[] = Array.from({ length: 5 }, (_, i) => start + i);
  if (start > 1) pages.unshift(1, "…");
  if (start + 4 < total) pages.push("…", total);
  return pages.filter((p, i, arr) => !(p === 1 && arr.indexOf(1) !== i));
}

export default function Pager({
  page,
  totalPages,
  onChange,
  withText = false,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  withText?: boolean;
}) {
  if (totalPages <= 1 && !withText) return null;
  const total = Math.max(totalPages, 1);
  return (
    <nav className="pager" aria-label="Paginación">
      <button type="button" className={`pager-btn${withText ? " wide" : ""}`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> {withText && "Anterior"}
      </button>
      {pageList(page, total).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="pager-ellipsis">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pager-btn${p === page ? " active" : withText ? "" : " bare"}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={`pager-btn${withText ? " wide" : ""}`} disabled={page >= total} onClick={() => onChange(page + 1)}>
        {withText && "Siguiente"} <ChevronRight size={16} />
      </button>
    </nav>
  );
}
