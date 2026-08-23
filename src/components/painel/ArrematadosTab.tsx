"use client";

import Link from "next/link";
import { Gavel, X } from "lucide-react";
import { Imovel } from "@/lib/types";
import { fmt, fmtData } from "@/lib/format";
import { useArrematados } from "@/lib/storage";

export default function ArrematadosTab({ imoveis }: { imoveis: Imovel[] }) {
  const { arrematados, desmarcar } = useArrematados();

  const registros = arrematados
    .map((a) => ({ a, im: imoveis.find((i) => i.id === a.id) }))
    .filter((r): r is { a: (typeof arrematados)[number]; im: Imovel } => !!r.im)
    .sort((x, y) => new Date(y.a.data).getTime() - new Date(x.a.data).getTime());

  if (registros.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
        <Gavel size={28} />
        <p className="font-medium">Nenhum imóvel arrematado ainda</p>
        <p className="text-sm">Na ficha de um imóvel, use “Marcar como arrematado” para registrar aqui.</p>
        <Link href="/buscar" className="mt-2 text-sm font-semibold text-brand hover:underline">
          Buscar imóveis
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {registros.map(({ a, im }) => {
        const ganho = im.avaliacao - a.precoArrematado;
        return (
          <div key={im.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href={`/imovel/${im.id}`} className="font-semibold text-foreground hover:text-brand">
                {im.endereco}
              </Link>
              <p className="text-sm text-muted">
                {im.cidade}/{im.estado} · Arrematado em {fmtData(a.data)}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted">Preço de arremate</p>
                <p className="font-semibold text-brand">{fmt(a.precoArrematado)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Ganho vs. avaliação</p>
                <p className={`font-semibold ${ganho >= 0 ? "text-success" : "text-danger"}`}>{fmt(ganho)}</p>
              </div>
              <button
                onClick={() => desmarcar(im.id)}
                aria-label="Remover"
                className="rounded-full p-1.5 text-muted hover:bg-muted-bg hover:text-danger"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
