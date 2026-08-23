"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown, FileText, Home, KeyRound, Link2, Loader2, TrendingUp } from "lucide-react";
import { calcViab } from "@/lib/viability";
import { fmt, fmtN } from "@/lib/format";
import { Imovel } from "@/lib/types";
import ResaleCalculator from "@/components/ResaleCalculator";
import BibliotecaAnalises from "@/components/BibliotecaAnalises";

type Modo = "locacao" | "venda" | "moradia";

function scoreLabel(score: number) {
  if (score >= 65) return { label: "Boa oportunidade", tone: "text-success", bg: "bg-success-bg" };
  if (score >= 40) return { label: "Vale estudar", tone: "text-accent-dark", bg: "bg-accent/10" };
  return { label: "Risco elevado", tone: "text-danger", bg: "bg-danger-bg" };
}

const MODOS: { id: Modo; label: string; icon: typeof KeyRound }[] = [
  { id: "locacao", label: "Locação", icon: KeyRound },
  { id: "venda", label: "Venda", icon: TrendingUp },
  { id: "moradia", label: "Moradia", icon: Home },
];

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";

export default function CalculadoraTab() {
  const [modo, setModo] = useState<Modo>("locacao");
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);

  const [urlInput, setUrlInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroUrl, setErroUrl] = useState<string | null>(null);
  const [tituloCarregado, setTituloCarregado] = useState<string | null>(null);

  const [avaliacao, setAvaliacao] = useState(500000);
  const [lance, setLance] = useState(300000);
  const [tipo, setTipo] = useState("Apartamento");
  const [modalidade, setModalidade] = useState<"Extrajudicial" | "Judicial">("Extrajudicial");
  const [ocupado, setOcupado] = useState(false);
  const [numPendencias, setNumPendencias] = useState(0);

  const [aluguel, setAluguel] = useState(2500);
  const [reforma, setReforma] = useState(15000);
  const [custoPendencias, setCustoPendencias] = useState(0);
  const [financiamento, setFinanciamento] = useState(false);
  const [taxaJuros, setTaxaJuros] = useState(11);
  const [prazo, setPrazo] = useState(360);

  const carregarPorUrl = async () => {
    setErroUrl(null);
    const match = urlInput.match(/\/imovel\/([a-zA-Z0-9-]+)/);
    if (!match) {
      setErroUrl("Cole a URL de um imóvel do Radar Leilões (ex: .../imovel/3).");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch(`/api/imoveis/${match[1]}`);
      if (!res.ok) throw new Error();
      const im: Imovel = await res.json();
      setAvaliacao(im.avaliacao);
      setLance(im.lance_minimo);
      setTipo(im.tipo);
      setModalidade(im.modalidade === "Judicial" ? "Judicial" : "Extrajudicial");
      setOcupado(im.ocupado);
      setNumPendencias(im.pendencias.length);
      setTituloCarregado(im.endereco);
    } catch {
      setErroUrl("Não encontramos esse imóvel. Confira a URL e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const imovelSintetico: Imovel = useMemo(
    () => ({
      id: "manual",
      fonte: "Manual",
      tipo,
      endereco: tituloCarregado ?? "",
      bairro: "",
      cidade: "",
      estado: "",
      area: 0,
      quartos: 0,
      vaga: false,
      avaliacao,
      lance_minimo: lance,
      modalidade,
      leiloeiro: "",
      data_leilao: null,
      status: "Ativo",
      ocupado,
      matricula: "",
      link: "#",
      foto: null,
      pendencias: Array.from({ length: numPendencias }, (_, i) => `Pendência ${i + 1}`),
      desconto: avaliacao > 0 ? Math.round((1 - lance / avaliacao) * 100) : 0,
    }),
    [tipo, tituloCarregado, avaliacao, lance, modalidade, ocupado, numPendencias]
  );

  const viab = calcViab(imovelSintetico, {
    financiamento,
    taxa_juros: taxaJuros,
    prazo,
    aluguel_esperado: aluguel,
    custo_reforma: reforma,
    custo_pendencias: custoPendencias,
  });
  const sl = scoreLabel(viab.score);
  const isMoradia = modo === "moradia";

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 print:hidden sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Link2 size={16} className="shrink-0 text-brand" />
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Cole a URL de um imóvel (ex: .../imovel/3)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={carregarPorUrl}
          disabled={carregando}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {carregando && <Loader2 size={14} className="animate-spin" />}
          Carregar imóvel
        </button>
      </div>
      {erroUrl && <p className="mb-3 text-xs text-danger print:hidden">{erroUrl}</p>}
      {tituloCarregado && !erroUrl && (
        <p className="mb-3 text-xs text-success print:hidden">Carregado: {tituloCarregado}</p>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="inline-flex rounded-xl border border-border bg-card p-1.5">
          {MODOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModo(m.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                modo === m.id ? "bg-brand text-white" : "text-foreground/70 hover:bg-muted-bg"
              }`}
            >
              <m.icon size={15} /> {m.label}
            </button>
          ))}
        </div>

        {modo !== "venda" && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-bg"
          >
            <FileText size={15} /> Gerar relatório
          </button>
        )}
      </div>

      {modo === "venda" ? (
        <ResaleCalculator valorArrematacaoInicial={lance} valorVendaInicial={avaliacao} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 print:hidden">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calculator size={16} className="text-brand" />
                {isMoradia ? "Simule a compra do seu imóvel" : "Simule qualquer imóvel de leilão"}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Valor de avaliação (R$)</label>
                  <input type="number" value={avaliacao} onChange={(e) => setAvaliacao(Number(e.target.value))} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Lance mínimo (R$)</label>
                  <input type="number" value={lance} onChange={(e) => setLance(Number(e.target.value))} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Tipo de imóvel</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={INPUT_CLS}>
                    {["Apartamento", "Casa", "Terreno", "Sala Comercial", "Galpão", "Kitnet"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Modalidade</label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value as "Extrajudicial" | "Judicial")}
                    className={INPUT_CLS}
                  >
                    <option value="Extrajudicial">Extrajudicial</option>
                    <option value="Judicial">Judicial</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Nº de pendências</label>
                  <input
                    type="number"
                    min={0}
                    value={numPendencias}
                    onChange={(e) => setNumPendencias(Number(e.target.value))}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex items-end gap-2 pb-2.5">
                  <input
                    id="ocupado"
                    type="checkbox"
                    checked={ocupado}
                    onChange={(e) => setOcupado(e.target.checked)}
                    className="h-4 w-4 accent-brand"
                  />
                  <label htmlFor="ocupado" className="text-xs font-medium text-muted">
                    Imóvel ocupado
                  </label>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>
                      {isMoradia ? "Aluguel equivalente na região (R$/mês)" : "Aluguel esperado (R$/mês)"}
                    </label>
                    <input type="number" value={aluguel} onChange={(e) => setAluguel(Number(e.target.value))} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Custo de reforma (R$)</label>
                    <input type="number" value={reforma} onChange={(e) => setReforma(Number(e.target.value))} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Custo de pendências (R$)</label>
                    <input
                      type="number"
                      value={custoPendencias}
                      onChange={(e) => setCustoPendencias(Number(e.target.value))}
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-2.5">
                    <input
                      id="fin"
                      type="checkbox"
                      checked={financiamento}
                      onChange={(e) => setFinanciamento(e.target.checked)}
                      className="h-4 w-4 accent-brand"
                    />
                    <label htmlFor="fin" className="text-xs font-medium text-muted">
                      Usar financiamento (80%)
                    </label>
                  </div>
                  {financiamento && (
                    <>
                      <div>
                        <label className={LABEL_CLS}>Taxa de juros (% a.a.)</label>
                        <input
                          type="number"
                          value={taxaJuros}
                          onChange={(e) => setTaxaJuros(Number(e.target.value))}
                          className={INPUT_CLS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Prazo (meses)</label>
                        <input type="number" value={prazo} onChange={(e) => setPrazo(Number(e.target.value))} className={INPUT_CLS} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center justify-between rounded-xl border border-border p-5 ${sl.bg}`}>
                <div>
                  <p className={`text-lg font-bold ${sl.tone}`}>
                    {isMoradia ? (viab.gc >= 0 ? "Boa oportunidade de compra" : "Pagando acima do mercado") : sl.label}
                  </p>
                  <p className="text-sm text-muted">
                    {isMoradia ? "Comparado ao valor de mercado" : "Score de viabilidade"} · {imovelSintetico.desconto}% de desconto
                  </p>
                </div>
                {!isMoradia && <p className={`text-3xl font-extrabold ${sl.tone}`}>{Math.round(viab.score)}</p>}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-card px-4 py-3">
                  <dt className="text-xs text-muted">Investimento total</dt>
                  <dd className="text-lg font-semibold text-foreground">{fmt(viab.total)}</dd>
                </div>
                <div className="rounded-lg border border-border bg-card px-4 py-3">
                  <dt className="text-xs text-muted">{isMoradia ? "Economia mensal vs. alugar" : "Fluxo de caixa mensal"}</dt>
                  <dd className={`text-lg font-semibold ${viab.fc >= 0 ? "text-success" : "text-danger"}`}>{fmt(viab.fc)}</dd>
                </div>
                {!isMoradia && (
                  <div className="rounded-lg border border-border bg-card px-4 py-3">
                    <dt className="text-xs text-muted">Yield líquido a.a.</dt>
                    <dd className="text-lg font-semibold text-foreground">{fmtN(viab.yl)}%</dd>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-card px-4 py-3">
                  <dt className="text-xs text-muted">{isMoradia ? "Patrimônio abaixo do mercado" : "Ganho de capital"}</dt>
                  <dd className="text-lg font-semibold text-foreground">{fmt(viab.gc)}</dd>
                </div>
                {!isMoradia && (
                  <>
                    <div className="rounded-lg border border-border bg-card px-4 py-3">
                      <dt className="text-xs text-muted">ROI</dt>
                      <dd className="text-lg font-semibold text-foreground">{fmtN(viab.roi)}%</dd>
                    </div>
                    <div className="rounded-lg border border-border bg-card px-4 py-3">
                      <dt className="text-xs text-muted">Payback</dt>
                      <dd className="text-lg font-semibold text-foreground">
                        {viab.pb < 99 ? `${fmtN(viab.pb)} anos` : "Negativo"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              <p className="text-[11px] leading-relaxed text-muted print:hidden">
                Estimativa educacional. Não considera todos os custos de arrematação (ITBI, cartório,
                comissão do leiloeiro) nem constitui recomendação financeira.
              </p>
            </div>
          </div>

          <div className="hidden print:mt-6 print:block">
            <h1 className="text-xl font-bold">Relatório de viabilidade — {tituloCarregado || "Imóvel simulado"}</h1>
            <p className="text-sm text-gray-600">
              {tipo} · {modalidade} · Avaliação {fmt(avaliacao)} · Lance mínimo {fmt(lance)} · Desconto{" "}
              {imovelSintetico.desconto}%
            </p>
            <p className="mt-4 text-xs text-gray-500">Gerado pelo Radar Leilões em {new Date().toLocaleDateString("pt-BR")}.</p>
          </div>
        </>
      )}

      <div className="mt-8 print:hidden">
        <button
          onClick={() => setMostrarBiblioteca((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ChevronDown size={16} className={`transition-transform ${mostrarBiblioteca ? "rotate-180" : ""}`} />
          Biblioteca de análises
        </button>
        {mostrarBiblioteca && (
          <div className="mt-3">
            <BibliotecaAnalises />
          </div>
        )}
      </div>
    </div>
  );
}
