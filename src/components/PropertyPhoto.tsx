"use client";

import { useState } from "react";

export default function PropertyPhoto({
  foto,
  alt,
  tipo,
  className,
}: {
  foto: string | null;
  alt: string;
  tipo: string;
  className?: string;
}) {
  const [quebrou, setQuebrou] = useState(false);

  if (foto && !quebrou) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt={alt}
        loading="lazy"
        onError={() => setQuebrou(true)}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }

  return <span className="text-sm font-medium">{tipo}</span>;
}
