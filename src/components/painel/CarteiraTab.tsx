"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, Trophy, Wallet } from "lucide-react";
import { Imovel } from "@/lib/types";
import { fmt, fmtN } from "@/lib/format";
import PatrimonioChart from "./PatrimonioChart";

type Cenario = "atual" | "padrao" | "agressivo";
type Estrategia = "renda" | "multiplicacao";

export default function CarteiraTab() {
  const [imoveis, setImoveis] = useState<Imovel[] | null>(null);

  useEffect(() => {
    fetch("/api/imoveis")
      .then((r) => r.json())
      .then((data) => setImoveis(data.imoveis ?? []));
  }, []);

  const [cenario, setCenario] = useState<Cenario>("atual");
  const [prazoAnos, setPrazoAnos] = useState(10);
  const [estrategia, setEstrategia] = useState<Estrategia>("multiplicacao");
  const [reinvestimento, setReinvestimento] = useState(100);

  if (imoveis === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="animate-spin" size={20} /> Carregando carteira...
      </div>
    );
  }

  const arrematados = imoveis.filter((im) => im.pipelineEtapa === "arrematado");

  const desembolsoTotal = arrematados.reduce((s, im) => s + (im.precoArrematado ?? im.lance_minimo), 0);
  const patrimonioTotal = arrematados.reduce((s, im) => s + im.avaliacao, 0);
  const lucroLiquido = patrimonioTotal - desembolsoTotal;
  const roiMedio = desembolsoTotal > 0 ? (lucroLiquido / desembolsoTotal) * 100 : 0;

  const taxaAnual = cenario === "atual" ? Math.max(roiMedio, 0) : cenario === "padrao" ? 20 : 30;
  const capitalInicial = patrimonioTotal > 0 ? patrimonioTotal : 0;

  const serie: number[] = [capitalInicial];
  for (let i = 1; i <= prazoAnos; i++) {
    const anterior = serie[i - 1];
    const lucroDoAno = anterior * (taxaAnual / 100);
    const reinvestido = lucroDoAno * (reinvestimento / 100);
    serie.push(anterior + reinvestido);
  }

  const capitalNaProjecao = serie[serie.length - 1];
  const lucroAno1 = capitalInicial * (taxaAnual / 100);
  const lucroRetiradoHoje = lucroAno1 * (1 - reinvestimento / 100);

  if (arrematados.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
        <Briefcase size={28} />
        <p className="font-medium">Sua carteira ainda não tem imóveis arrematados</p>
        <p className="text-sm">
          Marque um imóvel como “arrematado” na ficha dele para começar a acompanhar aqui a
          evolução do seu patrimônio.
        </p>
        <Link href="/painel?tab=meus-imoveis" className="mt-2 text-sm font-semibold text-brand hover:underline">
          Ver meus imóveis
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Trophy size={16} className="text-accent" />
        <h2 className="text-lg font-bold text-foreground">Carteira de Arrematados</h2>
      </div>
      <p className="mb-5 text-sm text-muted">Gestão consolidada da carteira, rentabilidade e evolução patrimonial.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Desembolso total" valor={fmt(desembolsoTotal)} />
        <Stat label="Patrimônio total" valor={fmt(patrimonioTotal)} tone="text-brand" />
        <Stat label="Lucro líquido (estimado)" valor={fmt(lucroLiquido)} tone={lucroLiquido >= 0 ? "text-success" : "text-danger"} />
        <Stat label="ROI médio da carteira" valor={`${fmtN(roiMedio)}%`} tone={roiMedio >= 0 ? "text-success" : "text-danger"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Imóveis arrematados</h3>
          <div className="space-y-2">
            {arrematados.map((im) => (
              <Link
                key={im.id}
                href={`/imovel/${im.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm hover:border-brand"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{im.endereco}</p>
                  <p className="text-xs text-muted">
                    {im.cidade}/{im.estado}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-brand">{fmt(im.precoArrematado ?? im.lance_minimo)}</p>
                  <p className="text-xs text-success">avaliado em {fmt(im.avaliacao)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet size={16} className="text-brand" /> Estratégias de investimento
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {(
                [
                  ["atual", "Cenário atual"],
                  ["padrao", "Média padrão 20% a.a."],
                  ["agressivo", "Agressivo 30% a.a."],
                ] as [Cenario, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setCenario(id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    cenario === id ? "border-brand bg-brand-light text-brand" : "border-border text-muted hover:bg-muted-bg"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between rounded-lg bg-muted-bg px-3 py-2 text-sm">
              <span className="text-muted">Taxa anual usada na simulação</span>
              <span className="font-bold text-brand">{fmtN(taxaAnual)}% ao ano</span>
            </div>

            <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
              <span>Prazo da projeção</span>
              <span>{prazoAnos} anos</span>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={prazoAnos}
              onChange={(e) => setPrazoAnos(Number(e.target.value))}
              className="mb-4 w-full accent-brand"
            />

            <p className="mb-2 text-xs font-medium text-muted">Como você pretende usar o lucro gerado pela carteira</p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setEstrategia("renda");
                  setReinvestimento(0);
                }}
                className={`rounded-lg border p-3 text-left ${
                  estrategia === "renda" ? "border-brand bg-brand-light" : "border-border hover:bg-muted-bg"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">Renda equivalente</p>
                <p className="text-xs text-muted">Lucro sacado — quanto equivale ao mês?</p>
              </button>
              <button
                onClick={() => {
                  setEstrategia("multiplicacao");
                  setReinvestimento(100);
                }}
                className={`rounded-lg border p-3 text-left ${
                  estrategia === "multiplicacao" ? "border-brand bg-brand-light" : "border-border hover:bg-muted-bg"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">Multiplicação</p>
                <p className="text-xs text-muted">Lucro reinvestido — patrimônio cresce</p>
              </button>
            </div>

            <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
              <span>Reinvestimento do lucro</span>
              <span>{reinvestimento}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={reinvestimento}
              onChange={(e) => setReinvestimento(Number(e.target.value))}
              className="mb-1 w-full accent-brand"
            />
            <div className="mb-4 flex justify-between text-[10px] text-muted">
              <span>0% (saca tudo)</span>
              <span>100% (reinveste tudo)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted-bg px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted">Capital na projeção</p>
                <p className="font-bold text-brand">{fmt(capitalNaProjecao)}</p>
              </div>
              <div className="rounded-lg bg-muted-bg px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted">Lucro retirado hoje</p>
                <p className="font-bold text-success">{fmt(lucroRetiradoHoje)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Projeção de evolução do patrimônio</h3>
            <PatrimonioChart valores={serie} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, valor, tone }: { label: string; valor: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone ?? "text-foreground"}`}>{valor}</p>
    </div>
  );
}
