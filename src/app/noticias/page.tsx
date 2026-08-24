import { ExternalLink, Newspaper } from "lucide-react";
import { getNoticias, FONTES_NOTICIAS } from "@/lib/noticias";
import { fmtData } from "@/lib/format";

export const metadata = { title: "Notícias do mercado imobiliário — Radar Leilões" };
export const revalidate = 3600;

export default async function NoticiasPage() {
  const noticias = await getNoticias();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-brand">
          <Newspaper size={20} />
          <span className="text-xs font-semibold uppercase tracking-wide">Notícias</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Mercado imobiliário</h1>
        <p className="mt-2 text-sm text-muted">
          Reunido automaticamente dos feeds públicos de {FONTES_NOTICIAS.join(", ")}. Título, resumo e link para
          a matéria original — sempre na fonte.
        </p>
      </div>

      {noticias.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
          <Newspaper size={28} />
          <p className="font-medium">Não foi possível carregar notícias agora</p>
          <p className="text-sm">As fontes podem estar temporariamente indisponíveis. Tente novamente em instantes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {noticias.map((n) => (
            <a
              key={n.id}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-card p-5 transition hover:border-brand/40 hover:shadow-sm"
            >
              <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-brand-light px-2 py-0.5 font-semibold text-brand">{n.fonte}</span>
                {n.publicadoEm && <span>{fmtData(n.publicadoEm)}</span>}
              </div>
              <h2 className="flex items-start justify-between gap-2 font-semibold text-foreground group-hover:text-brand">
                {n.titulo}
                <ExternalLink size={14} className="mt-1 shrink-0 text-muted group-hover:text-brand" />
              </h2>
              {n.resumo && <p className="mt-1.5 text-sm text-muted">{n.resumo}</p>}
            </a>
          ))}
        </div>
      )}

      <p className="mt-8 text-[11px] leading-relaxed text-muted">
        Conteúdo de terceiros, redistribuído a partir de feeds RSS públicos e oficiais de cada veículo — título,
        resumo e link de volta para a fonte, prática padrão de agregadores de notícia. O Radar Leilões não é
        autor nem detém direitos sobre essas matérias; leia o conteúdo completo diretamente na fonte.
      </p>
    </div>
  );
}
