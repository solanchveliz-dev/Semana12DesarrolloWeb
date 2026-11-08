"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

const MAX_MB = 5;

// Reduce la imagen en el navegador y la devuelve como data URL (JPEG liviano) para guardarla en la BD.
export async function fileToDataUrl(file: File, maxWidth = 360): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Solo se permiten PNG, JPG o WEBP");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`La imagen supera ${MAX_MB} MB`);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("No se pudo leer la imagen"));
      i.src = url;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImagePicker({
  value,
  onChange,
  title = "Sube la portada del libro",
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  title?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  async function handle(file?: File) {
    if (!file) return;
    try {
      setError("");
      onChange(await fileToDataUrl(file));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div
        className={`dropzone${drag ? " drag" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handle(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <div className="dropzone-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Vista previa" />
            <div>
              <div className="dropzone-title">Imagen seleccionada</div>
              <div className="dropzone-hint">Haz clic para cambiarla</div>
              <button
                type="button"
                className="link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon size={40} strokeWidth={1.4} color="#5d6b77" />
            <div>
              <div className="dropzone-title">{title}</div>
              <div className="dropzone-hint">PNG, JPG o WEBP (máx. {MAX_MB} MB)</div>
            </div>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            void handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="dropzone-hint" style={{ color: "var(--red-600)", marginTop: 6 }}>{error}</p>}
    </div>
  );
}
