"use client";

import { useEffect, useState } from "react";
import { LibraryScene } from "@/components/Illustrations";

// Si colocas una foto en /public/hero-biblioteca.jpg se mostrará; si no existe, se dibuja la ilustración.
export default function HeroVisual() {
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPhoto(true);
    img.src = "/hero-biblioteca.jpg";
  }, []);

  return (
    <div className="hero-visual">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="photo" src="/hero-biblioteca.jpg" alt="Biblioteca" />
      ) : (
        <LibraryScene />
      )}
      <svg className="curve" viewBox="0 0 210 600" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0H210C120 60 90 180 110 300 130 430 70 540 0 600Z" fill="#f7f4ef" />
        <path d="M210 0C128 58 96 178 116 300 136 430 78 540 6 600" stroke="#1d7d78" strokeWidth="26" fill="none" opacity="0.9" />
      </svg>
    </div>
  );
}
