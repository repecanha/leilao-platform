"use client";

import { Heart, Sparkles } from "lucide-react";
import { Imovel } from "@/lib/types";
import { calcViab, DEFAULT_VIAB_CONFIG } from "@/lib/viability";
import { useFavoritos } from "@/lib/storage";
import PropertyCard from "@/components/PropertyCard";

export default function SugeridosTab({ imoveis }: { imoveis: Imovel[] }) {
  const { favoritos } = useFavoritos();
  const meusFavoritos = imoveis.filter((im) => favoritos.some((f) => f.id === im.id));

  const ranked = [...imoveis]
    .map((im) => ({ im, viab: calcViab(im, DEFAULT_VIAB_CONFIG) }))
    .sort((a, b) => b.viab.score - a.viab.score)
    .slice(0, 8);

  return (
    <div>
      {meusFavoritos.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Heart size={15} className="text-danger" fill="currentColor" />
            Seus favoritos
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {meusFavoritos.map((im) => (
              <PropertyCard key={im.id} imovel={im} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-border bg-card p-4">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-brand" />
        <p className="text-sm text-muted">
          Ranking calculado com a calculadora de viabilidade usando premissas padrão (aluguel de
          R$ 2.500/mês, reforma de R$ 15.000, sem financiamento). Ajuste os números na ficha de
          cada imóvel para refinar a análise.
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">Nenhum imóvel disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ranked.map(({ im, viab }) => (
            <div key={im.id} className="relative">
              <span className="absolute -top-2 left-3 z-10 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-white shadow">
                Score {Math.round(viab.score)}
              </span>
              <PropertyCard imovel={im} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
