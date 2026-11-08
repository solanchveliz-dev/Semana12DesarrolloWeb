// Portada del libro: muestra la imagen subida o, si no tiene, una portada generada con su título.
const PALETTE = [
  ["#2f5d3a", "#1d3f26"],
  ["#1d3a63", "#0f2341"],
  ["#c8553d", "#8f3524"],
  ["#2f7f86", "#1a5a60"],
  ["#264a3d", "#16302a"],
  ["#6b2f45", "#45192b"],
  ["#8a6a2f", "#5c451a"],
  ["#3b4a6b", "#232d45"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

export default function BookCover({ title, coverUrl }: { title: string; coverUrl?: string | null }) {
  if (coverUrl) {
    return (
      <div className="cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={`Portada de ${title}`} />
      </div>
    );
  }
  const [a, b] = PALETTE[hash(title) % PALETTE.length];
  return (
    <div className="cover" style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} aria-label={`Portada de ${title}`}>
      <span className="cover-title">{title.length > 34 ? `${title.slice(0, 32)}…` : title}</span>
      <svg className="cover-motif" width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
        <path d="M1 9C5 2 9 1 11 5c2-4 6-3 10 4" stroke="#fff" strokeWidth="1.4" fill="none" />
      </svg>
    </div>
  );
}
