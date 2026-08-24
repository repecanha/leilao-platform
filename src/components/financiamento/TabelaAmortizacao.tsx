"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { fmt } from "@/lib/format";
import { ParcelaAmortizacao } from "@/lib/financiamento";

export default function TabelaAmortizacao({ tabela }: { tabela: ParcelaAmortizacao[] }) {
  const [expandida, setExpandida] = useState(false);
  const linhas = expandida ? tabela : tabela.slice(0, 12);

  return (
    <div>
      <div className={`overflow-auto rounded-xl border border-border bg-card ${expandida ? "max-h-[480px]" : ""}`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-3 py-2.5 font-medium">Mês</th>
              <th className="px-3 py-2.5 font-medium">Saldo inicial</th>
              <th className="px-3 py-2.5 font-medium">Amortização</th>
              <th className="px-3 py-2.5 font-medium">Juros</th>
              <th className="px-3 py-2.5 font-medium">Parcela</th>
              <th className="px-3 py-2.5 font-medium">Aporte extra</th>
              <th className="px-3 py-2.5 font-medium">Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((p) => (
              <tr key={p.mes} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-muted">{p.mes}</td>
                <td className="px-3 py-2">{fmt(p.saldoDevedorInicial)}</td>
                <td className="px-3 py-2">{fmt(p.amortizacao)}</td>
                <td className="px-3 py-2 text-danger">{fmt(p.juros)}</td>
                <td className="px-3 py-2 font-medium text-foreground">{fmt(p.parcela)}</td>
                <td className="px-3 py-2 text-success">{p.aporteExtra > 0 ? fmt(p.aporteExtra) : "—"}</td>
                <td className="px-3 py-2">{fmt(p.saldoDevedorFinal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabela.length > 12 && (
        <button
          onClick={() => setExpandida((v) => !v)}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ChevronDown size={16} className={`transition-transform ${expandida ? "rotate-180" : ""}`} />
          {expandida ? "Mostrar menos" : `Ver tabela completa (${tabela.length} meses)`}
        </button>
      )}
    </div>
  );
}
