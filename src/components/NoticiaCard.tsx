"use client";

import { useState } from "react";
import { ExternalLink, Newspaper } from "lucide-react";
import { fmtData } from "@/lib/format";
import { NoticiaItem } from "@/lib/noticias";

export default function NoticiaCard({ noticia }: { noticia: NoticiaItem }) {
  const [quebrou, setQuebrou] = useState(false);
  const mostrarImagem = noticia.imagemUrl && !quebrou;

  return (
    <a
      href={noticia.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-brand/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted-bg">
        {mostrarImagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={noticia.imagemUrl!}
            alt=""
            loading="lazy"
            onError={() => setQuebrou(true)}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Newspaper size={28} />
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-brand shadow-sm">
          {noticia.fonte}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-3 font-semibold text-foreground group-hover:text-brand">{noticia.titulo}</h2>
        {noticia.resumo && <p className="mt-1.5 line-clamp-3 text-sm text-muted">{noticia.resumo}</p>}
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          {noticia.publicadoEm ? <span>{fmtData(noticia.publicadoEm)}</span> : <span />}
          <span className="flex items-center gap-1 font-medium text-brand opacity-0 transition group-hover:opacity-100">
            Ler matéria <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}
