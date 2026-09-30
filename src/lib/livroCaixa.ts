import { CATEGORIAS_RECEITA, Lancamento } from "./types";

export type ResumoLivroCaixa = {
  desembolsoInicial: number;
  totalDespesas: number;
  totalReceitas: number;
  desembolsoTotal: number;
  lucro: number;
  roi: number;
  dataInicio: string | null;
  dataFim: string;
  diasPeriodo: number;
  rendimentoMensal: number;
  rendimentoAnualizado: number;
};

function ehReceita(l: Lancamento): boolean {
  return CATEGORIAS_RECEITA.includes(l.categoria);
}

// `desembolsoInicial` é o valor do lance (ou preço de arrematação, se já
// definido) — o próprio imóvel não é um "lançamento", só as despesas e
// receitas que acontecem depois do martelo.
export function resumirLivroCaixa(lancamentos: Lancamento[], desembolsoInicial: number): ResumoLivroCaixa {
  const despesas = lancamentos.filter((l) => !ehReceita(l));
  const receitas = lancamentos.filter(ehReceita);

  const totalDespesas = despesas.reduce((s, l) => s + Math.abs(l.valor), 0);
  const totalReceitas = receitas.reduce((s, l) => s + Math.abs(l.valor), 0);
  const desembolsoTotal = desembolsoInicial + totalDespesas;
  const lucro = totalReceitas - desembolsoTotal;
  const roi = desembolsoTotal > 0 ? (lucro / desembolsoTotal) * 100 : 0;

  const datas = lancamentos.map((l) => l.data).sort();
  const dataInicio = datas[0] ?? null;
  const dataFim = new Date().toISOString().slice(0, 10);
  const diasPeriodo = dataInicio
    ? Math.max(1, Math.round((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / 86400000))
    : 0;

  const meses = Math.max(1 / 30, diasPeriodo / 30);
  const rendimentoMensal = diasPeriodo > 0 ? (Math.pow(1 + roi / 100, 1 / meses) - 1) * 100 : 0;
  const rendimentoAnualizado = diasPeriodo > 0 ? (Math.pow(1 + rendimentoMensal / 100, 12) - 1) * 100 : 0;

  return {
    desembolsoInicial,
    totalDespesas,
    totalReceitas,
    desembolsoTotal,
    lucro,
    roi,
    dataInicio,
    dataFim,
    diasPeriodo,
    rendimentoMensal: isFinite(rendimentoMensal) ? rendimentoMensal : 0,
    rendimentoAnualizado: isFinite(rendimentoAnualizado) ? rendimentoAnualizado : 0,
  };
}
