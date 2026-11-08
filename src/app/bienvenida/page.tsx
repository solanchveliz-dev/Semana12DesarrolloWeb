import Link from "next/link";
import { BarChart3, BookOpen, Filter, Layers, Play, Search, UserRound, Users } from "lucide-react";
import { LogoBook } from "@/components/Illustrations";
import HeroVisual from "./HeroVisual";

const features = [
  { icon: Users, title: "Gestión de autores", description: "Registra, edita y elimina autores de tu biblioteca." },
  { icon: Search, title: "Búsqueda avanzada", description: "Encuentra libros por título, autor o palabra clave." },
  { icon: BarChart3, title: "Estadísticas", description: "Analiza tu colección con datos relevantes y actualizados." },
  { icon: Filter, title: "Filtros inteligentes", description: "Refina los resultados por género, autor y más." },
  { icon: Layers, title: "Paginación", description: "Explora grandes volúmenes de libros de forma ordenada y rápida." },
];

export default function BienvenidaPage() {
  return (
    <div className="landing">
      <header className="site-header">
        <Link href="/bienvenida" className="site-brand">
          <span className="name">
            <LogoBook size={58} />
            BIBLIOTECA
          </span>
          <span className="tagline">
            Sistema de gestión
            <br />
            bibliotecaria
          </span>
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <Link href="/bienvenida" className="active">Inicio</Link>
          <Link href="/authors">Autores</Link>
          <Link href="/books">Libros</Link>
          <Link href="/estadisticas">Estadísticas</Link>
        </nav>

        <Link href="/" className="btn btn-primary btn-pill">
          <UserRound size={20} />
          Ingresar
        </Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Bienvenido al sistema</p>
          <h1 className="hero-title">
            Gestiona tu biblioteca de forma <em>inteligente</em>
          </h1>
          <p className="hero-desc">
            Administra autores y libros, realiza búsquedas avanzadas con filtros y paginación, y consulta estadísticas
            detalladas de tu colección.
          </p>
          <div className="hero-actions">
            <Link href="/" className="btn btn-primary">
              <Play size={20} />
              Comenzar
            </Link>
            <Link href="/books" className="btn btn-outline">
              <BookOpen size={20} />
              Explorar catálogo
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="features">
        {features.map(({ icon: Icon, title, description }) => (
          <article className="feature" key={title}>
            <div className="feature-icon">
              <Icon size={34} strokeWidth={1.7} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
