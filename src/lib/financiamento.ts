export type SistemaAmortizacao = "SAC" | "PRICE";
export type EstrategiaAmortizacaoExtra = "reduzir_prazo" | "reduzir_parcela";
export type TipoAporte = "mensal" | "pontual" | "periodico";

export type Aporte = {
  id: string;
  tipo: TipoAporte;
  valor: number;
  aPartirDoMes: number;
  periodicidadeMeses?: number;
};

export type ParcelaAmortizacao = {
  mes: number;
  saldoDevedorInicial: number;
  amortizacao: number;
  juros: number;
  parcela: number;
  aporteExtra: number;
  saldoDevedorFinal: number;
};

export type ResumoFinanciamento = {
  primeiraParcela: number;
  ultimaParcela: number;
  totalPago: number;
  jurosTotais: number;
  rendaMinima: number;
  prazoMeses: number;
};

function calcParcelaPrice(saldo: number, taxaMensal: number, meses: number) {
  if (meses <= 0) return 0;
  if (taxaMensal === 0) return saldo / meses;
  return (saldo * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -meses));
}

function aporteDoMes(aportes: Aporte[], mes: number): number {
  return aportes.reduce((soma, a) => {
    if (mes < a.aPartirDoMes) return soma;
    if (a.tipo === "mensal") return soma + a.valor;
    if (a.tipo === "pontual") return mes === a.aPartirDoMes ? soma + a.valor : soma;
    const periodo = Math.max(1, a.periodicidadeMeses ?? 12);
    return (mes - a.aPartirDoMes) % periodo === 0 ? soma + a.valor : soma;
  }, 0);
}

// Gera a tabela de amortização mês a mês. Sem aportes extras, reproduz o SAC
// (amortização constante) ou o PRICE (parcela constante) padrão. Com aportes,
// a estratégia "reduzir prazo" mantém a amortização/parcela original — o
// saldo só cai mais rápido e o financiamento termina antes. A estratégia
// "reduzir parcela" recalcula a amortização/parcela constante a cada aporte,
// mantendo o prazo original mas reduzindo as parcelas futuras.
export function gerarTabelaAmortizacao(
  sistema: SistemaAmortizacao,
  valorFinanciado: number,
  taxaMensal: number,
  prazoMesesOriginal: number,
  aportes: Aporte[] = [],
  estrategia: EstrategiaAmortizacaoExtra = "reduzir_prazo"
): ParcelaAmortizacao[] {
  let saldo = valorFinanciado;
  let amortizacaoConstanteSAC = prazoMesesOriginal > 0 ? valorFinanciado / prazoMesesOriginal : 0;
  let parcelaFixaPRICE = calcParcelaPrice(valorFinanciado, taxaMensal, prazoMesesOriginal);

  const tabela: ParcelaAmortizacao[] = [];
  let mes = 0;
  const limiteSeguranca = prazoMesesOriginal * 2 + 12;

  while (saldo > 0.01 && mes < limiteSeguranca) {
    mes++;
    const juros = saldo * taxaMensal;
    let amortizacao: number;
    let parcela: number;
    if (sistema === "SAC") {
      amortizacao = Math.min(amortizacaoConstanteSAC, saldo);
      parcela = amortizacao + juros;
    } else {
      parcela = Math.min(parcelaFixaPRICE, saldo + juros);
      amortizacao = parcela - juros;
    }

    let saldoApos = Math.max(0, saldo - amortizacao);
    const extra = Math.min(aporteDoMes(aportes, mes), saldoApos);
    saldoApos -= extra;

    tabela.push({
      mes,
      saldoDevedorInicial: saldo,
      amortizacao,
      juros,
      parcela,
      aporteExtra: extra,
      saldoDevedorFinal: saldoApos,
    });

    saldo = saldoApos;

    if (extra > 0 && estrategia === "reduzir_parcela" && saldo > 0.01) {
      const mesesRestantes = Math.max(1, prazoMesesOriginal - mes);
      amortizacaoConstanteSAC = saldo / mesesRestantes;
      parcelaFixaPRICE = calcParcelaPrice(saldo, taxaMensal, mesesRestantes);
    }
  }

  return tabela;
}

export function resumirTabela(tabela: ParcelaAmortizacao[]): ResumoFinanciamento {
  if (tabela.length === 0) {
    return { primeiraParcela: 0, ultimaParcela: 0, totalPago: 0, jurosTotais: 0, rendaMinima: 0, prazoMeses: 0 };
  }
  const primeiraParcela = tabela[0].parcela;
  const ultimaParcela = tabela[tabela.length - 1].parcela;
  const totalPago = tabela.reduce((s, p) => s + p.parcela + p.aporteExtra, 0);
  const jurosTotais = tabela.reduce((s, p) => s + p.juros, 0);
  const maiorParcela = Math.max(...tabela.map((p) => p.parcela));
  return {
    primeiraParcela,
    ultimaParcela,
    totalPago,
    jurosTotais,
    rendaMinima: maiorParcela / 0.3,
    prazoMeses: tabela.length,
  };
}

export type ComparativoEconomia = {
  economiaTotal: number;
  jurosEvitados: number;
  prazoReduzidoMeses: number;
};

export function compararComSemExtra(
  sistema: SistemaAmortizacao,
  valorFinanciado: number,
  taxaMensal: number,
  prazoMesesOriginal: number,
  aportes: Aporte[],
  estrategia: EstrategiaAmortizacaoExtra
): { base: ParcelaAmortizacao[]; comExtra: ParcelaAmortizacao[]; economia: ComparativoEconomia } {
  const base = gerarTabelaAmortizacao(sistema, valorFinanciado, taxaMensal, prazoMesesOriginal, [], "reduzir_prazo");
  const comExtra = gerarTabelaAmortizacao(sistema, valorFinanciado, taxaMensal, prazoMesesOriginal, aportes, estrategia);

  const totalBase = base.reduce((s, p) => s + p.parcela, 0);
  const totalExtra = comExtra.reduce((s, p) => s + p.parcela + p.aporteExtra, 0);
  const jurosBase = base.reduce((s, p) => s + p.juros, 0);
  const jurosExtra = comExtra.reduce((s, p) => s + p.juros, 0);

  return {
    base,
    comExtra,
    economia: {
      economiaTotal: totalBase - totalExtra,
      jurosEvitados: jurosBase - jurosExtra,
      prazoReduzidoMeses: base.length - comExtra.length,
    },
  };
}

export type PremissasComparativo = {
  aluguelMensal: number;
  taxaValorizacaoImovelAnual: number;
  taxaRetornoInvestimentoAnual: number;
  encargosMensaisPosse: number;
};

export const DEFAULT_PREMISSAS_COMPARATIVO: PremissasComparativo = {
  aluguelMensal: 0,
  taxaValorizacaoImovelAnual: 5,
  taxaRetornoInvestimentoAnual: 10,
  encargosMensaisPosse: 0,
};

export type PontoComparativo = {
  ano: number;
  patrimonioCompra: number;
  patrimonioAlugar: number;
};

// Simula, ano a ano, o patrimônio líquido de quem compra financiado (valor
// do imóvel corrigido pela valorização, menos o saldo devedor) contra quem
// aluga e investe a diferença: o capital que não foi usado como entrada, mais
// a diferença mensal entre a parcela+encargos e o aluguel (quando positiva),
// aplicados a uma taxa de retorno. É uma simplificação didática — não simula
// IR sobre o investimento nem custos de transação da venda do imóvel.
export function compararCompraVsAlugar(
  valorImovel: number,
  entrada: number,
  custosAquisicao: number,
  tabelaFinanciamento: ParcelaAmortizacao[],
  premissas: PremissasComparativo
): PontoComparativo[] {
  const taxaValorizacaoMensal = Math.pow(1 + premissas.taxaValorizacaoImovelAnual / 100, 1 / 12) - 1;
  const taxaRetornoMensal = Math.pow(1 + premissas.taxaRetornoInvestimentoAnual / 100, 1 / 12) - 1;

  let valorImovelAtual = valorImovel;
  let investimentoAlugar = entrada + custosAquisicao;
  const prazoMeses = tabelaFinanciamento.length;

  const pontos: PontoComparativo[] = [
    { ano: 0, patrimonioCompra: valorImovel - (tabelaFinanciamento[0]?.saldoDevedorInicial ?? 0), patrimonioAlugar: investimentoAlugar },
  ];

  for (let mes = 1; mes <= prazoMeses; mes++) {
    valorImovelAtual *= 1 + taxaValorizacaoMensal;
    const parcelaMes = tabelaFinanciamento[mes - 1]?.parcela ?? 0;
    const custoCompraMes = parcelaMes + premissas.encargosMensaisPosse;
    const diferenca = Math.max(0, custoCompraMes - premissas.aluguelMensal);
    investimentoAlugar = investimentoAlugar * (1 + taxaRetornoMensal) + diferenca;

    if (mes % 12 === 0) {
      const saldoDevedor = tabelaFinanciamento[mes - 1]?.saldoDevedorFinal ?? 0;
      pontos.push({ ano: mes / 12, patrimonioCompra: valorImovelAtual - saldoDevedor, patrimonioAlugar: investimentoAlugar });
    }
  }

  return pontos;
}
