"use client";

import { useMemo, useState } from "react";
import { FileWarning, Home, Receipt } from "lucide-react";
import { calcRevenda, CustosRegularizacao, DEFAULT_CUSTOS } from "@/lib/resaleCalc";
import { fmt, fmtN } from "@/lib/format";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";

export default function ResaleCalculator({
  valorArrematacaoInicial,
  valorVendaInicial,
}: {
  valorArrematacaoInicial: number;
  valorVendaInicial: number;
}) {
  const [c, setC] = useState<CustosRegularizacao>({
    ...DEFAULT_CUSTOS,
    valorArrematacao: valorArrematacaoInicial,
    valorVenda: valorVendaInicial,
  });

  const set = <K extends keyof CustosRegularizacao>(key: K, value: CustosRegularizacao[K]) =>
    setC((prev) => ({ ...prev, [key]: value }));

  const r = useMemo(() => calcRevenda(c), [c]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Home size={16} className="text-brand" /> Valores do negócio
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Valor de arrematação (R$)</label>
              <input
                type="number"
                value={c.valorArrematacao}
                onChange={(e) => set("valorArrematacao", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Valor de venda (R$)</label>
              <input
                type="number"
                value={c.valorVenda}
                onChange={(e) => set("valorVenda", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>Quitação de parcelamento/financiamento (R$)</label>
              <input
                type="number"
                value={c.quitacaoFinanciamento}
                onChange={(e) => set("quitacaoFinanciamento", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt size={16} className="text-brand" /> Custos de regularização
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLS}>Escritura (%)</label>
              <input type="number" value={c.escrituraPct} onChange={(e) => set("escrituraPct", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>ITBI (%)</label>
              <input type="number" value={c.itbiPct} onChange={(e) => set("itbiPct", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Registro (%)</label>
              <input type="number" value={c.registroPct} onChange={(e) => set("registroPct", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Assessoria (%)</label>
              <input type="number" value={c.assessoriaPct} onChange={(e) => set("assessoriaPct", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Corretor de venda (%)</label>
              <input
                type="number"
                value={c.corretorVendaPct}
                onChange={(e) => set("corretorVendaPct", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Imposto de renda (%)</label>
              <input type="number" value={c.irPct} onChange={(e) => set("irPct", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Desocupação (R$)</label>
              <input type="number" value={c.desocupacao} onChange={(e) => set("desocupacao", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Gravames (R$)</label>
              <input type="number" value={c.gravames} onChange={(e) => set("gravames", Number(e.target.value))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Outros (R$)</label>
              <input type="number" value={c.outrosCustos} onChange={(e) => set("outrosCustos", Number(e.target.value))} className={INPUT_CLS} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileWarning size={16} className="text-brand" /> Débitos do imóvel (assumidos pelo arrematante)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLS}>IPTU (R$)</label>
              <input
                type="number"
                value={c.iptuArrematante}
                onChange={(e) => set("iptuArrematante", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Condomínio (R$)</label>
              <input
                type="number"
                value={c.condominioArrematante}
                onChange={(e) => set("condominioArrematante", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Outros débitos (R$)</label>
              <input
                type="number"
                value={c.outrosDebitos}
                onChange={(e) => set("outrosDebitos", Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-fit overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-dark text-left text-white">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Item</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">Valor estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            <Linha label="Valor de venda" valor={c.valorVenda} />
            <Linha label="(-) Quitação parcelamento/financiamento" valor={-c.quitacaoFinanciamento} negativo />
            <Linha label="SALDO (entra na conta após venda)" valor={r.saldo} destaque />
            <Linha label="Reposição de caixa (desembolso)" valor={-r.reposicaoDeCaixa} negativo />
            <Linha label="(-) Corretagem de venda" valor={-r.corretagemVenda} negativo />
            <Linha label="LUCRO BRUTO" valor={r.lucroBruto} destaque />
            <Linha label="(-) Imposto de renda" valor={-r.impostoRenda} negativo />
            <Linha label="LUCRO LÍQUIDO" valor={r.lucroLiquido} destaque forte />
          </tbody>
        </table>

        <div className="flex items-center justify-between bg-muted-bg px-4 py-3 text-sm">
          <span className="font-medium text-muted">ROI sobre o desembolso</span>
          <span className={`font-bold ${r.roiSobreDesembolso >= 0 ? "text-success" : "text-danger"}`}>
            {fmtN(r.roiSobreDesembolso)}%
          </span>
        </div>

        <p className="px-4 py-3 text-[11px] leading-relaxed text-muted">
          Valores pré-preenchidos são apenas referências e não consistem no valor real deste
          imóvel. Pesquise os custos de regularização e débitos reais antes de decidir.
        </p>
      </div>
    </div>
  );
}

function Linha({
  label,
  valor,
  negativo,
  destaque,
  forte,
}: {
  label: string;
  valor: number;
  negativo?: boolean;
  destaque?: boolean;
  forte?: boolean;
}) {
  return (
    <tr className={destaque ? "bg-brand-light/40" : ""}>
      <td className={`px-4 py-2.5 ${forte ? "font-bold text-foreground" : destaque ? "font-semibold text-foreground" : "text-muted"}`}>
        {label}
      </td>
      <td
        className={`px-4 py-2.5 text-right tabular-nums ${
          forte
            ? valor >= 0
              ? "font-bold text-success"
              : "font-bold text-danger"
            : negativo
              ? "text-danger"
              : destaque
                ? "font-semibold text-foreground"
                : "text-foreground"
        }`}
      >
        {fmt(valor)}
      </td>
    </tr>
  );
}
