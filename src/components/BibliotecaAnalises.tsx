"use client";

import Link from "next/link";
import { NotebookText, Trash2, X } from "lucide-react";
import { fmt, fmtN, fmtData } from "@/lib/format";
import { useAnalises } from "@/lib/storage";

function scoreTone(score: number) {
  if (score >= 65) return "text-success";
  if (score >= 40) return "text-accent-dark";
  return "text-danger";
}

export default function BibliotecaAnalises() {
  const { analises, limpar, remover } = useAnalises();

  if (analises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-16 text-center text-muted">
        <NotebookText size={24} />
        <p className="font-medium">Nenhuma análise salva ainda</p>
        <p className="text-sm">Ajuste a calculadora acima e clique em “Salvar análise”.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Biblioteca de análises</h3>
        <button
          onClick={limpar}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger"
        >
          <Trash2 size={13} /> Limpar histórico
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Imóvel</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Yield líquido</th>
              <th className="px-4 py-3 font-medium">ROI</th>
              <th className="px-4 py-3 font-medium">Investimento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {analises.map((a) => (
              <tr key={a.uid} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/imovel/${a.imovelId}`} className="font-medium text-foreground hover:text-brand">
                    {a.endereco}
                  </Link>
                  <p className="text-xs text-muted">
                    {a.cidade}/{a.estado}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted">{fmtData(a.data)}</td>
                <td className={`px-4 py-3 font-semibold ${scoreTone(a.score)}`}>{Math.round(a.score)}</td>
                <td className="px-4 py-3">{fmtN(a.yl)}%</td>
                <td className="px-4 py-3">{fmtN(a.roi)}%</td>
                <td className="px-4 py-3">{fmt(a.total)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => remover(a.uid)}
                    aria-label="Remover análise"
                    className="rounded-full p-1 text-muted hover:bg-muted-bg hover:text-danger"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
