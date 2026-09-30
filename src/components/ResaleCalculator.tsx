"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Building2, FileWarning, Home, Receipt, ReceiptText, TrendingDown } from "lucide-react";
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

  const taxaTocada = useRef(false);
  useEffect(() => {
    fetch("/api/cdi")
      .then((r) => r.json())
      .then((json) => {
        if (!taxaTocada.current) setC((prev) => ({ ...prev, taxaOportunidadeAnual: json.taxaAnual }));
      });
  }, []);

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

        <div className={CARD_CLS}>
          <CardHeader icon={TrendingDown} title="Custo de oportunidade" />
          <label className={LABEL_CLS}>Taxa de referência (% a.a.)</label>
          <input
            type="number"
            step={0.1}
            value={c.taxaOportunidadeAnual}
            onChange={(e) => {
              taxaTocada.current = true;
              set("taxaOportunidadeAnual", Number(e.target.value) || 0);
            }}
            className={INPUT_CLS}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Pré-preenchido com o CDI acumulado dos últimos 12 meses (fonte: Banco Central). Representa o quanto
            o capital exposto à operação renderia nesse período se investido a essa taxa em vez de parado no
            negócio — entra como &ldquo;Perda de rentabilidade&rdquo; no resumo.
          </p>
        </div>
      </div>

      <div className="h-fit space-y-4 lg:sticky lg:top-4">
        <div className={`rounded-xl border border-border p-5 ${r.roi >= 0 ? "bg-success-bg" : "bg-danger-bg"}`}>
          <p className="text-xs text-muted">Resultado da margem</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className={`text-3xl font-extrabold ${r.roi >= 0 ? "text-success" : "text-danger"}`}>{fmtN(r.roi)}%</p>
            <p className={`text-lg font-semibold ${r.lucroLiquido >= 0 ? "text-success" : "text-danger"}`}>
              {fmt(r.lucroLiquido)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border rounded-xl border border-border bg-card text-sm">
          <div className="px-4 py-3">
            <p className="text-xs text-muted">Exposição de caixa</p>
            <p className="font-semibold text-foreground">{fmt(r.exposicaoDeCaixa)}</p>
          </div>
          <div className="px-4 py-3">
            <span className="text-xs text-muted">ROI anualizado</span>
            <p className="font-bold text-foreground">{fmtN(r.roiAnualizado)}%</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark text-left text-white">
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Resumo</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">Valor estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              <Linha label="Lance (valor de arrematação)" valor={c.valorArrematacao} />
              <Linha label="Valor de venda" valor={c.valorVenda} />
              <Linha label="Valor a declarar no IRPF (ganho de capital)" valor={r.ganhoCapitalTributavel} />
              <Linha label="Escritura" valor={r.escrituraRS} negativo />
              <Linha label="ITBI" valor={r.itbiRS} negativo />
              <Linha label="Registro" valor={r.registroRS} negativo />
              <Linha label="Assessoria (aquisição)" valor={r.assessoriaAquisicaoRS} negativo />
              <Linha label="Reforma" valor={c.reformaMaoDeObra + c.reformaMaterial} negativo />
              <Linha label="Dívida propter rem" valor={c.dividaPropterRem} negativo />
              <Linha label="Débitos assumidos (IPTU/condomínio/outros)" valor={r.totalDebitosPontuais} negativo />
              <Linha label="Custo mensal até a revenda" valor={r.custoMensalTotal} negativo />
              <Linha label="Corretor (venda)" valor={r.corretagemVendaRS} negativo />
              <Linha label="Assessoria (venda)" valor={r.assessoriaVendaRS} negativo />
              <Linha label="Perda de rentabilidade" valor={r.perdaRentabilidade} negativo />
              <Linha label="Imposto de renda" valor={r.impostoRenda} negativo />
              <Linha label="Total desembolso" valor={r.custoTotal} destaque forte />
            </tbody>
          </table>

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
