"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ChevronDown, Home, LayoutDashboard, Users } from "lucide-react";
import { BookStack, LogoBook } from "./Illustrations";
import { USER } from "@/lib/config";

const items = [
  { href: "/bienvenida", label: "Inicio", icon: Home, match: (p: string) => p === "/bienvenida" },
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/authors", label: "Autores", icon: Users, match: (p: string) => p.startsWith("/authors") },
  { href: "/books", label: "Libros", icon: BookOpen, match: (p: string) => p.startsWith("/books") },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3, match: (p: string) => p.startsWith("/estadisticas") },
];

export default function Sidebar() {
  const pathname = usePathname() || "/";
  return (
    <aside className="sidebar">
      <Link href="/" className="brand-block">
        <LogoBook size={58} stroke="#fff" />
        <span className="brand-name">BIBLIOTECA</span>
        <span className="brand-subtitle">Sistema de Gestión Bibliotecaria</span>
      </Link>
      <div className="sidebar-sep" />
      <nav className="sidebar-nav" aria-label="Navegación principal">
        {items.map(({ href, label, icon: Icon, match }) => (
          <Link key={label} href={href} className={`nav-item${match(pathname) ? " active" : ""}`}>
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-art">
        <BookStack />
      </div>
      <div className="sidebar-profile">
        <div className="profile-badge">{USER.initials}</div>
        <div className="profile-meta">
          <div className="profile-name">{USER.name}</div>
          <div className="profile-role">{USER.role}</div>
        </div>
        <ChevronDown size={18} />
      </div>
    </aside>
  );
}