"use client";

import { CircleDollarSign, Infinity as InfinityIcon } from "lucide-react";
import { useAnalises } from "@/lib/storage";

export default function CreditosTab() {
  const { analises } = useAnalises();

  return (
    <div>
      <div className="rounded-xl border border-brand/30 bg-brand-light p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
          <InfinityIcon size={22} />
        </span>
        <h2 className="mt-3 text-xl font-bold text-foreground">Análises ilimitadas</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Esta é uma versão aberta e gratuita da plataforma — não há sistema de créditos ou
          cobrança por uso. Busque, analise e salve quantos imóveis quiser.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CircleDollarSign size={16} className="text-brand" />
            Uso nesta plataforma
          </div>
          <p className="mt-3 text-3xl font-extrabold text-brand">{analises.length}</p>
          <p className="text-sm text-muted">análises de viabilidade salvas até agora</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Como os dados são guardados</h3>
          <p className="mt-2 text-sm text-muted">
            Favoritos, imóveis arrematados e análises salvas ficam no armazenamento local do seu
            navegador — não exigem cadastro, mas também não sincronizam entre dispositivos.
          </p>
        </div>
      </div>
    </div>
  );
}
