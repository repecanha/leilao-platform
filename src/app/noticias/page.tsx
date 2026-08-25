import { Newspaper } from "lucide-react";
import { getNoticias, FONTES_NOTICIAS } from "@/lib/noticias";
import NoticiaCard from "@/components/NoticiaCard";
import AtualizarNoticiasButton from "@/components/AtualizarNoticiasButton";

export const metadata = { title: "Notícias do mercado imobiliário — Radar Leilões" };
export const revalidate = 3600;

export default async function NoticiasPage() {
  const noticias = await getNoticias();
  const atualizadoEm = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand">
            <Newspaper size={20} />
            <span className="text-xs font-semibold uppercase tracking-wide">Notícias</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mercado imobiliário</h1>
          <p className="mt-2 text-sm text-muted">
            Reunido automaticamente dos feeds públicos de {FONTES_NOTICIAS.join(", ")}. Título, resumo e link
            para a matéria original — sempre na fonte.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AtualizarNoticiasButton />
          <span className="text-[11px] text-muted">Atualizado às {atualizadoEm}</span>
        </div>
      </div>

      {noticias.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
          <Newspaper size={28} />
          <p className="font-medium">Não foi possível carregar notícias agora</p>
          <p className="text-sm">As fontes podem estar temporariamente indisponíveis. Tente novamente em instantes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((n) => (
            <NoticiaCard key={n.id} noticia={n} />
          ))}
        </div>
      )}

      <p className="mt-8 text-[11px] leading-relaxed text-muted">
        Conteúdo de terceiros, redistribuído a partir de feeds RSS públicos e oficiais de cada veículo — título,
        resumo, imagem de capa e link de volta para a fonte, prática padrão de agregadores de notícia. O Radar
        Leilões não é autor nem detém direitos sobre essas matérias ou imagens; leia o conteúdo completo
        diretamente na fonte.
      </p>
    </div>
  );
}
