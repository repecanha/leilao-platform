"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Calculator } from "lucide-react";
import { Imovel } from "@/lib/types";
import { calcViab, DEFAULT_VIAB_CONFIG } from "@/lib/viability";
import { fmt, fmtN } from "@/lib/format";
import { useAnalises } from "@/lib/storage";

function scoreLabel(score: number) {
  if (score >= 65) return { label: "Boa oportunidade", tone: "text-success", bg: "bg-success-bg" };
  if (score >= 40) return { label: "Vale estudar", tone: "text-accent-dark", bg: "bg-accent/10" };
  return { label: "Risco elevado", tone: "text-danger", bg: "bg-danger-bg" };
}

export default function ViabilityCalculator({ imovel }: { imovel: Imovel }) {
  const [cfg, setCfg] = useState(DEFAULT_VIAB_CONFIG);
  const [salvo, setSalvo] = useState(false);
  const { salvar } = useAnalises();

  const viab = useMemo(() => calcViab(imovel, cfg), [imovel, cfg]);
  const sl = scoreLabel(viab.score);

  const set = <K extends keyof typeof cfg>(key: K, value: (typeof cfg)[K]) => {
    setCfg((c) => ({ ...c, [key]: value }));
    setSalvo(false);
  };

  const handleSalvar = () => {
    salvar({
      imovelId: imovel.id,
      endereco: imovel.endereco,
      cidade: imovel.cidade,
      estado: imovel.estado,
      score: viab.score,
      yl: viab.yl,
      roi: viab.roi,
      fc: viab.fc,
      total: viab.total,
      cfg,
    });
    setSalvo(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calculator size={16} className="text-brand" />
          Calculadora de Viabilidade
        </div>
        <button
          onClick={handleSalvar}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
            salvo ? "bg-success-bg text-success" : "bg-brand-light text-brand hover:bg-brand/20"
          }`}
        >
          {salvo ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {salvo ? "Salva no painel" : "Salvar análise"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Aluguel esperado (R$/mês)</label>
          <input
            type="number"
            value={cfg.aluguel_esperado}
            onChange={(e) => set("aluguel_esperado", Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Custo de reforma (R$)</label>
          <input
            type="number"
            value={cfg.custo_reforma}
            onChange={(e) => set("custo_reforma", Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Custo de pendências (R$)</label>
          <input
            type="number"
            value={cfg.custo_pendencias}
            onChange={(e) => set("custo_pendencias", Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="financiamento"
            type="checkbox"
            checked={cfg.financiamento}
            onChange={(e) => set("financiamento", e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          <label htmlFor="financiamento" className="text-xs font-medium text-muted">
            Usar financiamento (80%)
          </label>
        </div>

        {cfg.financiamento && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Taxa de juros (% a.a.)</label>
              <input
                type="number"
                value={cfg.taxa_juros}
                onChange={(e) => set("taxa_juros", Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Prazo (meses)</label>
              <input
                type="number"
                value={cfg.prazo}
                onChange={(e) => set("prazo", Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
              />
            </div>
          </>
        )}
      </div>

      <div className={`mt-5 flex items-center justify-between rounded-lg px-4 py-3 ${sl.bg}`}>
        <div>
          <p className={`text-sm font-bold ${sl.tone}`}>{sl.label}</p>
          <p className="text-xs text-muted">Score de viabilidade</p>
        </div>
        <p className={`text-2xl font-extrabold ${sl.tone}`}>{Math.round(viab.score)}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">Investimento total</dt>
          <dd className="font-semibold text-foreground">{fmt(viab.total)}</dd>
        </div>
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">Fluxo de caixa mensal</dt>
          <dd className={`font-semibold ${viab.fc >= 0 ? "text-success" : "text-danger"}`}>{fmt(viab.fc)}</dd>
        </div>
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">Yield líquido a.a.</dt>
          <dd className="font-semibold text-foreground">{fmtN(viab.yl)}%</dd>
        </div>
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">Ganho de capital</dt>
          <dd className="font-semibold text-foreground">{fmt(viab.gc)}</dd>
        </div>
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">ROI sobre investimento</dt>
          <dd className="font-semibold text-foreground">{fmtN(viab.roi)}%</dd>
        </div>
        <div className="rounded-lg bg-muted-bg px-3 py-2">
          <dt className="text-xs text-muted">Payback</dt>
          <dd className="font-semibold text-foreground">
            {viab.pb < 99 ? `${fmtN(viab.pb)} anos` : "Negativo"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Estimativa educacional baseada nos dados informados. Não considera todos os custos de
        arrematação (ITBI, cartório, comissão do leiloeiro) nem constitui recomendação financeira.
      </p>
    </div>
  );
}
