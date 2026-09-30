"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { Imovel } from "@/lib/types";
import LivroCaixa from "@/components/LivroCaixa";

export default function LivroCaixaTab() {
  const [imoveis, setImoveis] = useState<Imovel[] | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/imoveis")
      .then((r) => r.json())
      .then((data) => {
        const lista: Imovel[] = data.imoveis ?? [];
        setImoveis(lista);
        const arrematados = lista.filter((im) => im.pipelineEtapa === "arrematado");
        if (arrematados.length > 0) setExpandido(arrematados[0].id);
      });
  }, []);

  if (imoveis === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="animate-spin" size={20} /> Carregando livro caixa...
      </div>
    );
  }

  const arrematados = imoveis.filter((im) => im.pipelineEtapa === "arrematado");

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <BookOpen size={16} className="text-brand" />
        <h2 className="text-lg font-bold text-foreground">Livro Caixa</h2>
      </div>
      <p className="mb-5 text-sm text-muted">
        O lucro começa a ser construído depois do martelo. Registre cada despesa e receita da arrematação até
        a venda de cada imóvel e acompanhe a evolução do resultado, comparado com o CDI real do período.
      </p>

      {arrematados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
          <BookOpen size={28} />
          <p className="font-medium">Nenhum imóvel arrematado ainda</p>
          <p className="text-sm">
            Marque um imóvel como &ldquo;arrematado&rdquo; na ficha dele para começar o livro caixa aqui.
          </p>
          <Link href="/painel?tab=meus-imoveis" className="mt-2 text-sm font-semibold text-brand hover:underline">
            Ver meus imóveis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {arrematados.map((im) => {
            const aberto = expandido === im.id;
            return (
              <div key={im.id} className="rounded-xl border border-border bg-card">
                <button
                  onClick={() => setExpandido(aberto ? null : im.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{im.endereco}</p>
                    <p className="text-xs text-muted">
                      {im.cidade}/{im.estado}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/imovel/${im.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                    >
                      Ver ficha <ExternalLink size={11} />
                    </Link>
                    <ChevronDown size={16} className={`text-muted transition-transform ${aberto ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {aberto && (
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    <LivroCaixa imovelId={im.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
