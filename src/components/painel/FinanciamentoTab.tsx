"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Landmark, Percent, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import {
  Aporte,
  DEFAULT_PREMISSAS_COMPARATIVO,
  EstrategiaAmortizacaoExtra,
  PremissasComparativo,
  SistemaAmortizacao,
  TipoAporte,
  compararCompraVsAlugar,
  compararComSemExtra,
  gerarTabelaAmortizacao,
  resumirTabela,
} from "@/lib/financiamento";
import { fmt } from "@/lib/format";
import ComparativoChart from "@/components/financiamento/ComparativoChart";
import { ComposicaoParcelaChart, SaldoDevedorChart } from "@/components/financiamento/ComposicaoParcelaChart";
import TabelaAmortizacao from "@/components/financiamento/TabelaAmortizacao";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";
const CARD_CLS = "rounded-xl border border-border bg-card p-5";

export default function FinanciamentoTab() {
  const [valorImovel, setValorImovel] = useState(500000);
  const [entrada, setEntrada] = useState(100000);
  const [prazoAnos, setPrazoAnos] = useState(30);
  const [taxaJurosAnual, setTaxaJurosAnual] = useState(11);
  const [sistemaPrincipal, setSistemaPrincipal] = useState<SistemaAmortizacao>("SAC");

  const [mostrarPremissas, setMostrarPremissas] = useState(false);
  const [premissas, setPremissas] = useState<PremissasComparativo>({
    ...DEFAULT_PREMISSAS_COMPARATIVO,
    aluguelMensal: 2000,
  });

  const [sistemaExtra, setSistemaExtra] = useState<SistemaAmortizacao>("SAC");
  const [estrategiaExtra, setEstrategiaExtra] = useState<EstrategiaAmortizacaoExtra>("reduzir_prazo");
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [novoAporte, setNovoAporte] = useState<{ tipo: TipoAporte; valor: number; aPartirDoMes: number; periodicidadeMeses: number }>({
    tipo: "mensal",
    valor: 500,
    aPartirDoMes: 1,
    periodicidadeMeses: 12,
  });

  const taxaMensal = useMemo(() => Math.pow(1 + taxaJurosAnual / 100, 1 / 12) - 1, [taxaJurosAnual]);
  const prazoMeses = prazoAnos * 12;
  const valorFinanciado = Math.max(0, valorImovel - entrada);

  const tabelaSAC = useMemo(
    () => gerarTabelaAmortizacao("SAC", valorFinanciado, taxaMensal, prazoMeses),
    [valorFinanciado, taxaMensal, prazoMeses]
  );
  const tabelaPRICE = useMemo(
    () => gerarTabelaAmortizacao("PRICE", valorFinanciado, taxaMensal, prazoMeses),
    [valorFinanciado, taxaMensal, prazoMeses]
  );
  const resumoSAC = useMemo(() => resumirTabela(tabelaSAC), [tabelaSAC]);
  const resumoPRICE = useMemo(() => resumirTabela(tabelaPRICE), [tabelaPRICE]);

  const tabelaPrincipal = sistemaPrincipal === "SAC" ? tabelaSAC : tabelaPRICE;
  const resumoPrincipal = sistemaPrincipal === "SAC" ? resumoSAC : resumoPRICE;

  const pontosComparativo = useMemo(
    () => compararCompraVsAlugar(valorImovel, entrada, 0, tabelaPrincipal, premissas),
    [valorImovel, entrada, tabelaPrincipal, premissas]
  );
  const ultimoPonto = pontosComparativo[pontosComparativo.length - 1];

  const { comExtra: tabelaComExtra, economia } = useMemo(
    () => compararComSemExtra(sistemaExtra, valorFinanciado, taxaMensal, prazoMeses, aportes, estrategiaExtra),
    [sistemaExtra, valorFinanciado, taxaMensal, prazoMeses, aportes, estrategiaExtra]
  );

  const adicionarAporte = () => {
    setAportes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: novoAporte.tipo,
        valor: novoAporte.valor,
        aPartirDoMes: novoAporte.aPartirDoMes,
        periodicidadeMeses: novoAporte.tipo === "periodico" ? novoAporte.periodicidadeMeses : undefined,
      },
    ]);
  };

  const removerAporte = (id: string) => setAportes((prev) => prev.filter((a) => a.id !== id));

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground">Calculadora de Financiamento</h2>
        <p className="text-sm text-muted">Simule parcelas SAC e PRICE, compare com alugar + investir, e teste amortização extra.</p>
      </div>

      <div className={CARD_CLS}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className={LABEL_CLS}>Valor do imóvel (R$)</label>
            <input type="number" value={valorImovel} onChange={(e) => setValorImovel(Number(e.target.value) || 0)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Entrada (R$)</label>
            <input type="number" value={entrada} onChange={(e) => setEntrada(Number(e.target.value) || 0)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Prazo (anos)</label>
            <input type="number" value={prazoAnos} onChange={(e) => setPrazoAnos(Number(e.target.value) || 0)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Juros a.a. (%)</label>
            <input type="number" step={0.1} value={taxaJurosAnual} onChange={(e) => setTaxaJurosAnual(Number(e.target.value) || 0)} className={INPUT_CLS} />
          </div>
        </div>

        <button
          onClick={() => setMostrarPremissas((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
        >
          <ChevronDown size={14} className={`transition-transform ${mostrarPremissas ? "rotate-180" : ""}`} />
          Ajustar premissas — aluguel, valorização e investimento
        </button>
        {mostrarPremissas && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
            <div>
              <label className={LABEL_CLS}>Aluguel equivalente (R$/mês)</label>
              <input
                type="number"
                value={premissas.aluguelMensal}
                onChange={(e) => setPremissas((p) => ({ ...p, aluguelMensal: Number(e.target.value) || 0 }))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Valorização do imóvel (% a.a.)</label>
              <input
                type="number"
                value={premissas.taxaValorizacaoImovelAnual}
                onChange={(e) => setPremissas((p) => ({ ...p, taxaValorizacaoImovelAnual: Number(e.target.value) || 0 }))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Retorno do investimento (% a.a.)</label>
              <input
                type="number"
                value={premissas.taxaRetornoInvestimentoAnual}
                onChange={(e) => setPremissas((p) => ({ ...p, taxaRetornoInvestimentoAnual: Number(e.target.value) || 0 }))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Encargos de posse (R$/mês)</label>
              <input
                type="number"
                value={premissas.encargosMensaisPosse}
                onChange={(e) => setPremissas((p) => ({ ...p, encargosMensaisPosse: Number(e.target.value) || 0 }))}
                className={INPUT_CLS}
              />
              <p className="mt-1 text-[11px] text-muted">IPTU + condomínio, só entram no cenário de compra.</p>
            </div>
          </div>
        )}
        {mostrarPremissas && (
          <p className="mt-2 text-[11px] text-muted">
            Aluguel em R$ 0 assume moradia gratuita e infla artificialmente o patrimônio de alugar — ajuste para
            um valor realista da região.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted">Sistema em destaque:</span>
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["SAC", "PRICE"] as SistemaAmortizacao[]).map((s) => (
            <button
              key={s}
              onClick={() => setSistemaPrincipal(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                sistemaPrincipal === s ? "bg-brand text-white" : "text-foreground/70 hover:bg-muted-bg"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Parcela 1ª ({sistemaPrincipal})</dt>
          <dd className="text-lg font-semibold text-foreground">{fmt(resumoPrincipal.primeiraParcela)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Renda mínima sugerida</dt>
          <dd className="text-lg font-semibold text-foreground">{fmt(resumoPrincipal.rendaMinima)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Patrimônio comprando ({prazoAnos}a)</dt>
          <dd className="text-lg font-semibold text-success">{fmt(ultimoPonto?.patrimonioCompra ?? 0)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Patrimônio alugando ({prazoAnos}a)</dt>
          <dd className="text-lg font-semibold text-accent-dark">{fmt(ultimoPonto?.patrimonioAlugar ?? 0)}</dd>
        </div>
      </dl>

      <div className={`mt-5 ${CARD_CLS}`}>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp size={16} className="text-brand" /> Comprar vs. alugar + investir
        </div>
        <ComparativoChart pontos={pontosComparativo} />
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Estimativa didática: patrimônio de compra = valor do imóvel corrigido pela valorização menos o saldo
          devedor; patrimônio de aluguel = capital não usado como entrada, mais a diferença mensal entre
          parcela+encargos e aluguel, investidos à taxa de retorno informada. Não considera IR sobre o
          investimento nem custos de venda do imóvel.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={CARD_CLS}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Landmark size={16} className="text-brand" /> SAC
          </div>
          <DetalheLinha label="1ª parcela" valor={fmt(resumoSAC.primeiraParcela)} />
          <DetalheLinha label="Última parcela" valor={fmt(resumoSAC.ultimaParcela)} />
          <DetalheLinha label="Total pago" valor={fmt(resumoSAC.totalPago)} />
          <DetalheLinha label="Juros totais" valor={fmt(resumoSAC.jurosTotais)} destaque />
          <DetalheLinha label="Renda mínima (30%)" valor={fmt(resumoSAC.rendaMinima)} />
        </div>
        <div className={CARD_CLS}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Landmark size={16} className="text-brand" /> PRICE
          </div>
          <DetalheLinha label="Parcela (fixa)" valor={fmt(resumoPRICE.primeiraParcela)} />
          <DetalheLinha label="Última parcela" valor={fmt(resumoPRICE.ultimaParcela)} />
          <DetalheLinha label="Total pago" valor={fmt(resumoPRICE.totalPago)} />
          <DetalheLinha label="Juros totais" valor={fmt(resumoPRICE.jurosTotais)} destaque />
          <DetalheLinha label="Renda mínima (30%)" valor={fmt(resumoPRICE.rendaMinima)} />
        </div>
      </div>

      <div className={`mt-5 ${CARD_CLS}`}>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Percent size={16} className="text-brand" /> Amortização extra
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLS}>Sistema</label>
            <select value={sistemaExtra} onChange={(e) => setSistemaExtra(e.target.value as SistemaAmortizacao)} className={INPUT_CLS}>
              <option value="SAC">SAC</option>
              <option value="PRICE">PRICE</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Estratégia</label>
            <select
              value={estrategiaExtra}
              onChange={(e) => setEstrategiaExtra(e.target.value as EstrategiaAmortizacaoExtra)}
              className={INPUT_CLS}
            >
              <option value="reduzir_prazo">Reduzir prazo</option>
              <option value="reduzir_parcela">Reduzir parcela</option>
            </select>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Aportes programados</p>
          {aportes.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {aportes.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-muted-bg px-3 py-2 text-xs">
                  <span>
                    {fmt(a.valor)} · {labelTipo(a.tipo)} · a partir do mês {a.aPartirDoMes}
                    {a.tipo === "periodico" ? ` · a cada ${a.periodicidadeMeses} meses` : ""}
                  </span>
                  <button onClick={() => removerAporte(a.id)} aria-label="Remover aporte" className="text-muted hover:text-danger">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <select
              value={novoAporte.tipo}
              onChange={(e) => setNovoAporte((n) => ({ ...n, tipo: e.target.value as TipoAporte }))}
              className={INPUT_CLS}
            >
              <option value="mensal">Mensal</option>
              <option value="pontual">Pontual</option>
              <option value="periodico">Periódico</option>
            </select>
            <input
              type="number"
              placeholder="Valor R$"
              value={novoAporte.valor || ""}
              onChange={(e) => setNovoAporte((n) => ({ ...n, valor: Number(e.target.value) || 0 }))}
              className={INPUT_CLS}
            />
            <input
              type="number"
              placeholder="A partir do mês"
              value={novoAporte.aPartirDoMes || ""}
              onChange={(e) => setNovoAporte((n) => ({ ...n, aPartirDoMes: Number(e.target.value) || 1 }))}
              className={INPUT_CLS}
            />
            {novoAporte.tipo === "periodico" && (
              <input
                type="number"
                placeholder="A cada N meses"
                value={novoAporte.periodicidadeMeses || ""}
                onChange={(e) => setNovoAporte((n) => ({ ...n, periodicidadeMeses: Number(e.target.value) || 12 }))}
                className={INPUT_CLS}
              />
            )}
            <button
              onClick={adicionarAporte}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-light px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/20"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
        </div>

        {aportes.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <dt className="text-xs text-muted">Economia total</dt>
              <dd className="font-semibold text-success">{fmt(economia.economiaTotal)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <dt className="text-xs text-muted">Juros evitados</dt>
              <dd className="font-semibold text-success">{fmt(economia.jurosEvitados)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <dt className="text-xs text-muted">Prazo reduzido</dt>
              <dd className="font-semibold text-foreground">{economia.prazoReduzidoMeses} meses</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={CARD_CLS}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet size={16} className="text-brand" /> Composição da parcela ({sistemaExtra})
          </div>
          <ComposicaoParcelaChart tabela={tabelaComExtra} />
        </div>
        <div className={CARD_CLS}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet size={16} className="text-brand" /> Saldo devedor
          </div>
          <SaldoDevedorChart tabela={tabelaComExtra} />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-foreground">Tabela de amortização ({sistemaExtra})</p>
        <TabelaAmortizacao tabela={tabelaComExtra} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Estimativa educacional. Não considera CET (custo efetivo total), seguros obrigatórios, tarifas
        bancárias, TR/correção monetária nem regras específicas de cada banco — use como referência, não como
        proposta de financiamento.
      </p>
    </div>
  );
}

function labelTipo(tipo: TipoAporte) {
  if (tipo === "mensal") return "mensal";
  if (tipo === "pontual") return "pontual";
  return "periódico";
}

function DetalheLinha({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${destaque ? "text-danger" : "text-foreground"}`}>{valor}</span>
    </div>
  );
}
