"use client";

import { useMemo, useState } from "react";
import { Banknote, Building2, FileWarning, Home, Receipt, ReceiptText } from "lucide-react";
import {
  calcRevenda,
  CustosRegularizacao,
  DEFAULT_CUSTOS,
  ModalidadePagamento,
  ModoImpostoRenda,
} from "@/lib/resaleCalc";
import { fmt, fmtN } from "@/lib/format";
import CustoPctRSInput from "@/components/CustoPctRSInput";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";
const CARD_CLS = "rounded-xl border border-border bg-card p-5";

function CardHeader({ icon: Icon, title }: { icon: typeof Home; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon size={16} className="text-brand" />
      {title}
    </div>
  );
}

function Legenda() {
  return (
    <div className="mb-3 flex items-center gap-3 text-[11px] text-muted">
      <span className="flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Dedutível do IR
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Não dedutível
      </span>
    </div>
  );
}

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
        <div className={CARD_CLS}>
          <CardHeader icon={Home} title="Valores do negócio" />
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
            <div>
              <label className={LABEL_CLS}>Período até a revenda (meses)</label>
              <input
                type="number"
                value={c.periodoRevendaMeses}
                onChange={(e) => set("periodoRevendaMeses", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Modalidade de pagamento</label>
              <select
                value={c.modalidadePagamento}
                onChange={(e) => set("modalidadePagamento", e.target.value as ModalidadePagamento)}
                className={INPUT_CLS}
              >
                <option value="avista">À vista</option>
                <option value="financiado">Financiado</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>
            {c.modalidadePagamento !== "avista" && (
              <div className="col-span-2">
                <label className={LABEL_CLS}>Entrada (% do valor de arrematação)</label>
                <input
                  type="number"
                  value={c.percentualEntrada}
                  onChange={(e) => set("percentualEntrada", Number(e.target.value) || 0)}
                  className={INPUT_CLS}
                />
                <p className="mt-1 text-[11px] text-muted">
                  Aproximação: a exposição de caixa considera só a entrada; o saldo financiado/parcelado
                  não é amortizado mês a mês nesta versão.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={CARD_CLS}>
          <CardHeader icon={Banknote} title="Custos na aquisição" />
          <Legenda />
          <div className="grid grid-cols-2 gap-3">
            <CustoPctRSInput
              label="Escritura"
              pct={c.escrituraPct}
              base={c.valorArrematacao}
              dedutivel
              onChange={(pct) => set("escrituraPct", pct)}
            />
            <CustoPctRSInput
              label="ITBI"
              pct={c.itbiPct}
              base={c.valorArrematacao}
              dedutivel
              onChange={(pct) => set("itbiPct", pct)}
            />
            <CustoPctRSInput
              label="Registro"
              pct={c.registroPct}
              base={c.valorArrematacao}
              dedutivel
              onChange={(pct) => set("registroPct", pct)}
            />
            <CustoPctRSInput
              label="Assessoria"
              pct={c.assessoriaPct}
              base={c.valorArrematacao}
              dedutivel={false}
              onChange={(pct) => set("assessoriaPct", pct)}
            />
            <div>
              <label className={LABEL_CLS}>
                Reforma: mão de obra (R$) <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
              </label>
              <input
                type="number"
                value={c.reformaMaoDeObra || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("reformaMaoDeObra", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                Reforma: material (R$) <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
              </label>
              <input
                type="number"
                value={c.reformaMaterial || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("reformaMaterial", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                Dívida propter rem (R$) <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              </label>
              <input
                type="number"
                value={c.dividaPropterRem || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("dividaPropterRem", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                Outros custos (R$) <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              </label>
              <input
                type="number"
                value={c.outrosCustos || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("outrosCustos", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className={CARD_CLS}>
          <CardHeader icon={Receipt} title="Custos na venda" />
          <Legenda />
          <div className="grid grid-cols-2 gap-3">
            <CustoPctRSInput
              label="Corretor"
              pct={c.corretorVendaPct}
              base={c.valorVenda}
              dedutivel
              onChange={(pct) => set("corretorVendaPct", pct)}
            />
            <CustoPctRSInput
              label="Assessoria"
              pct={c.assessoriaVendaPct}
              base={c.valorVenda}
              dedutivel={false}
              onChange={(pct) => set("assessoriaVendaPct", pct)}
            />
          </div>
        </div>

        <div className={CARD_CLS}>
          <CardHeader icon={FileWarning} title="Débitos assumidos na arrematação" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLS}>IPTU em aberto (R$)</label>
              <input
                type="number"
                value={c.iptuArrematante || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("iptuArrematante", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Condomínio em aberto (R$)</label>
              <input
                type="number"
                value={c.condominioArrematante || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("condominioArrematante", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Outros débitos (R$)</label>
              <input
                type="number"
                value={c.outrosDebitos || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("outrosDebitos", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Desocupação (R$)</label>
              <input
                type="number"
                value={c.desocupacao || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("desocupacao", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Gravames (R$)</label>
              <input
                type="number"
                value={c.gravames || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("gravames", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className={CARD_CLS}>
          <CardHeader icon={Building2} title="Custo mensal até a revenda" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>IPTU (R$/mês)</label>
              <input
                type="number"
                value={c.iptuMensal || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("iptuMensal", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Condomínio (R$/mês)</label>
              <input
                type="number"
                value={c.condominioMensal || ""}
                placeholder="R$ 0,00"
                onChange={(e) => set("condominioMensal", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Multiplicado pelo período até a revenda ({c.periodoRevendaMeses}{" "}
            {c.periodoRevendaMeses === 1 ? "mês" : "meses"}) e somado à exposição de caixa e ao custo total.
          </p>
        </div>

        <div className={CARD_CLS}>
          <CardHeader icon={ReceiptText} title="Imposto de renda" />
          <div className="mb-3 flex gap-4">
            {(["auto", "manual"] as ModoImpostoRenda[]).map((m) => (
              <label key={m} className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                <input
                  type="radio"
                  checked={c.modoIR === m}
                  onChange={() => set("modoIR", m)}
                  className="accent-brand"
                />
                {m === "auto" ? "Calcular automaticamente (15% PF)" : "Informar manualmente"}
              </label>
            ))}
          </div>
          {c.modoIR === "manual" && (
            <div>
              <label className={LABEL_CLS}>IR na venda (R$)</label>
              <input
                type="number"
                value={c.irManual || ""}
                placeholder={fmt(r.impostoRenda)}
                onChange={(e) => set("irManual", Number(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </div>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            15% sobre o ganho de capital tributável (venda menos custo de aquisição e os custos dedutíveis
            marcados acima) — regra padrão de pessoa física. Consulte um contador para PJ ou casos de isenção.
          </p>
        </div>
      </div>

      <div className="h-fit space-y-4 lg:sticky lg:top-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark text-left text-white">
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Item</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">Valor estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              <Linha label="Valor de venda" valor={c.valorVenda} />
              <Linha label="(-) Custo de aquisição (arrematação + custos)" valor={-(c.valorArrematacao + r.custosAquisicaoDedutiveis + r.custosAquisicaoNaoDedutiveis)} negativo />
              <Linha label="(-) Custos de venda" valor={-(r.custosVendaDedutiveis + r.custosVendaNaoDedutiveis)} negativo />
              <Linha label="(-) Débitos assumidos e custo mensal" valor={-(r.totalDebitosPontuais + r.custoMensalTotal)} negativo />
              <Linha label="(-) Imposto de renda" valor={-r.impostoRenda} negativo />
              <Linha label="LUCRO LÍQUIDO" valor={r.lucroLiquido} destaque forte />
            </tbody>
          </table>

          <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted-bg text-sm">
            <div className="px-4 py-3">
              <p className="text-xs text-muted">Exposição de caixa</p>
              <p className="font-semibold text-foreground">{fmt(r.exposicaoDeCaixa)}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-muted">Custo total</p>
              <p className="font-semibold text-foreground">{fmt(r.custoTotal)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border border-t border-border text-sm">
            <div className="px-4 py-3">
              <span className="text-xs text-muted">ROI sobre a exposição de caixa</span>
              <p className={`font-bold ${r.roi >= 0 ? "text-success" : "text-danger"}`}>{fmtN(r.roi)}%</p>
            </div>
            <div className="px-4 py-3">
              <span className="text-xs text-muted">ROI anualizado</span>
              <p className="font-bold text-foreground">{fmtN(r.roiAnualizado)}%</p>
            </div>
          </div>

          <p className="px-4 py-3 text-[11px] leading-relaxed text-muted">
            Valores pré-preenchidos são apenas referências e não consistem no valor real deste imóvel.
            Estimativa educacional; pesquise os custos de regularização e débitos reais antes de decidir.
          </p>
        </div>
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
