// Ilustraciones vectoriales propias (libros + hojas) usadas como decoración.

export function LogoBook({ size = 52, stroke = "currentColor" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 64 50" fill="none" aria-hidden="true">
      <path d="M32 10C25 5 14 4 5 6v34c9-2 20-1 27 4 7-5 18-6 27-4V6c-9-2-20-1-27 4Z" stroke={stroke} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M32 10v34" stroke={stroke} strokeWidth="3.4" />
      <path d="M2 12v32c10-2 21-1 30 4 9-5 20-6 30-4V12" stroke={stroke} strokeWidth="3.4" strokeLinejoin="round" />
    </svg>
  );
}

function Leaf({ x, y, r, s = 1, fill }: { x: number; y: number; r: number; s?: number; fill: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
      d="M0 0C6-10 18-14 26-12 22-4 12 4 0 0Z"
      fill={fill}
    />
  );
}

export function BookStack({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const leaf = variant === "dark" ? "#3fa8b8" : "#8fd0c8";
  const leaf2 = variant === "dark" ? "#2b8aa0" : "#6dbfb5";
  return (
    <svg viewBox="0 0 240 230" aria-hidden="true">
      {/* tallo y hojas */}
      <path d="M118 120C112 90 104 60 92 30" stroke={leaf2} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Leaf x={112} y={96} r={-120} s={1.1} fill={leaf} />
      <Leaf x={108} y={78} r={-40} s={1} fill={leaf2} />
      <Leaf x={101} y={58} r={-135} s={1} fill={leaf} />
      <Leaf x={98} y={46} r={-55} s={0.85} fill={leaf2} />
      <Leaf x={92} y={30} r={-95} s={0.8} fill={leaf} />
      {/* libro inferior */}
      <path d="M24 196l150-14 44 14-150 18z" fill="#173f63" />
      <path d="M24 196v14l44 18v-14z" fill="#0f2d4a" />
      <path d="M68 214l150-18v12L68 228z" fill="#f2e6d4" />
      <path d="M68 217l150-18M68 221l150-18" stroke="#d9c9b1" strokeWidth="1" />
      {/* libro medio */}
      <path d="M34 170l142-12 40 12-142 16z" fill="#2c7f99" />
      <path d="M34 170v14l40 16v-14z" fill="#1d6179" />
      <path d="M74 186l142-16v12L74 200z" fill="#f6ead8" />
      <path d="M74 190l142-16M74 194l142-16" stroke="#dccbb3" strokeWidth="1" />
      {/* libro superior */}
      <path d="M44 146l130-10 36 11-130 14z" fill="#1f5a7d" />
      <path d="M44 146v12l36 15v-12z" fill="#164763" />
      <path d="M80 161l130-14v12L80 173z" fill="#f4e7d3" />
      <path d="M80 165l130-14" stroke="#dccbb3" strokeWidth="1" />
      {/* cajita */}
      <path d="M128 118l44-4 18 8-44 5z" fill="#f2d9b8" />
      <path d="M128 118v14l18 7v-13z" fill="#ddbf98" />
      <path d="M146 126l44-5v14l-44 5z" fill="#ead0ad" />
    </svg>
  );
}

export function OpenBookArt() {
  return (
    <svg viewBox="0 0 560 150" aria-hidden="true">
      <defs>
        <linearGradient id="ob-page" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7f2f2" />
        </linearGradient>
      </defs>
      {/* ramas izquierda */}
      <g opacity="0.95">
        <path d="M140 140C150 110 168 80 196 58" stroke="#2f8f8a" strokeWidth="3" fill="none" />
        <Leaf x={152} y={118} r={-160} s={1.4} fill="#2f8f8a" />
        <Leaf x={162} y={98} r={-60} s={1.3} fill="#4aa7a0" />
        <Leaf x={172} y={86} r={-170} s={1.2} fill="#2f8f8a" />
        <Leaf x={182} y={72} r={-70} s={1.1} fill="#4aa7a0" />
        <Leaf x={194} y={60} r={-120} s={1} fill="#2f8f8a" />
        <path d="M110 150C118 128 130 110 146 96" stroke="#7cbfb8" strokeWidth="2" fill="none" />
        <Leaf x={120} y={130} r={-150} s={1} fill="#86c9c1" />
        <Leaf x={132} y={112} r={-60} s={0.9} fill="#86c9c1" />
      </g>
      {/* libro abierto */}
      <path d="M210 120c40-30 90-36 120-22 30-14 80-8 120 22l-6 10c-40-26-86-30-114-18-28-12-74-8-114 18z" fill="#1d5f74" />
      <path d="M214 116c40-34 86-40 116-26v34c-30-12-76-8-116 18z" fill="url(#ob-page)" />
      <path d="M446 116c-40-34-86-40-116-26v34c30-12 76-8 116 18z" fill="url(#ob-page)" />
      <path d="M234 108c26-14 52-18 80-12M238 98c26-14 50-16 76-10M244 88c22-10 44-12 70-7M346 96c28-6 54-2 80 12M346 86c26-6 50-4 76 10M346 76c26-5 48-3 70 7"
        stroke="#9fc4c6" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ramas derecha */}
      <g>
        <path d="M470 140C480 108 500 80 528 62" stroke="#2f8f8a" strokeWidth="3" fill="none" />
        <Leaf x={480} y={120} r={-20} s={1.3} fill="#2f8f8a" />
        <Leaf x={490} y={100} r={-110} s={1.2} fill="#4aa7a0" />
        <Leaf x={502} y={86} r={-15} s={1.1} fill="#2f8f8a" />
        <Leaf x={514} y={74} r={-100} s={1} fill="#4aa7a0" />
      </g>
    </svg>
  );
}

// Escena de biblioteca para la portada (se muestra si no hay foto en /public/hero-biblioteca.jpg)
export function LibraryScene() {
  const spines = [
    "#7a3b2e", "#2f4f6a", "#8b6a3e", "#3d5e4c", "#6e2f3a", "#a07d4f", "#2c4660", "#5a3d2b", "#46685a", "#8a4a32",
    "#30536f", "#9c7a4a", "#4a3a5c", "#6b5236", "#2e5a55", "#7d3d34", "#556d80", "#8d6b40",
  ];
  const shelf = (y: number, x0: number, seed: number) => {
    let x = x0;
    const out = [];
    for (let i = 0; i < 22 && x < 760; i++) {
      const w = 12 + ((i * 7 + seed) % 9);
      const h = 70 + ((i * 13 + seed) % 26);
      out.push(<rect key={`${y}-${i}`} x={x} y={y - h} width={w} height={h} rx="1.5" fill={spines[(i + seed) % spines.length]} opacity="0.92" />);
      x += w + 2;
    }
    return out;
  };
  return (
    <svg className="scene" viewBox="0 0 760 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ls-wall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#efe2cf" />
          <stop offset="1" stopColor="#c9a983" />
        </linearGradient>
        <radialGradient id="ls-light" cx="0.25" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#fff7e6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff7e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ls-table" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c08a58" />
          <stop offset="1" stopColor="#8b5a34" />
        </linearGradient>
        <linearGradient id="ls-navy" x1="0" x2="1">
          <stop offset="0" stopColor="#1b3c55" />
          <stop offset="1" stopColor="#264f6c" />
        </linearGradient>
        <linearGradient id="ls-teal" x1="0" x2="1">
          <stop offset="0" stopColor="#145a5a" />
          <stop offset="1" stopColor="#1f7470" />
        </linearGradient>
      </defs>
      <rect width="760" height="560" fill="url(#ls-wall)" />
      {/* ventana */}
      <path d="M150 360V110a70 70 0 0 1 140 0v250z" fill="#f8f1e4" />
      <path d="M220 40v320M150 200h140M150 280h140" stroke="#b58f68" strokeWidth="6" />
      <rect width="760" height="560" fill="url(#ls-light)" />
      {/* estantería */}
      <rect x="360" y="20" width="420" height="380" fill="#5b3b25" />
      <g>{shelf(120, 372, 1)}</g>
      <rect x="360" y="120" width="420" height="10" fill="#3f2818" />
      <g>{shelf(230, 372, 5)}</g>
      <rect x="360" y="230" width="420" height="10" fill="#3f2818" />
      <g>{shelf(340, 372, 9)}</g>
      <rect x="360" y="340" width="420" height="10" fill="#3f2818" />
      {/* mesa */}
      <path d="M60 420h700v140H60z" fill="url(#ls-table)" />
      <path d="M60 420h700" stroke="#d9a877" strokeWidth="4" />
      {/* libros */}
      <g transform="translate(250 330)">
        <path d="M0 110l300-18 70 22-300 22z" fill="url(#ls-teal)" />
        <path d="M70 136l300-22v26L70 164z" fill="#f2e3c8" />
        <path d="M0 110v24l70 30v-28z" fill="#0f4a4a" />
        <path d="M30 70l250-30 70 30-250 34z" fill="url(#ls-navy)" />
        <path d="M100 104l250-34v30L100 134z" fill="#f6e9d1" />
        <path d="M100 110l250-34M100 118l250-34M100 126l250-34" stroke="#e0ccab" strokeWidth="1.2" />
        <path d="M30 70v30l70 34v-30z" fill="#132f45" />
        <ellipse cx="190" cy="68" rx="46" ry="16" fill="none" stroke="#c9a45c" strokeWidth="3" />
        <path d="M168 66c10-6 20-6 22 0 2-6 12-6 22 0" stroke="#c9a45c" strokeWidth="3" fill="none" />
        <path d="M120 110l14 70-16-10-12 14 2-70z" fill="#e9d2a8" />
      </g>
      {/* planta */}
      <g transform="translate(640 300)">
        <path d="M10 120h70l-8 60H18z" fill="#f1ece4" />
        <path d="M45 120C40 80 30 40 10 10M45 120C55 80 70 50 100 30M45 120C45 90 50 60 60 30" stroke="#3d6b3a" strokeWidth="3" fill="none" />
        <Leaf x={14} y={20} r={200} s={1.8} fill="#6f9d4f" />
        <Leaf x={30} y={60} r={150} s={1.6} fill="#86b25d" />
        <Leaf x={90} y={36} r={-30} s={1.7} fill="#6f9d4f" />
        <Leaf x={70} y={70} r={-10} s={1.5} fill="#86b25d" />
        <Leaf x={58} y={34} r={-100} s={1.4} fill="#5e8b43" />
      </g>
    </svg>
  );
}
