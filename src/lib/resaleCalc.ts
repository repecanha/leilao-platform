export type ModalidadePagamento = "avista" | "financiado" | "parcelado";
export type ModoImpostoRenda = "auto" | "manual";

export type CustosRegularizacao = {
  valorArrematacao: number;
  valorVenda: number;
  periodoRevendaMeses: number;
  modalidadePagamento: ModalidadePagamento;
  percentualEntrada: number;

  // Custos de aquisição — dedutíveis da base de ganho de capital
  escrituraPct: number;
  itbiPct: number;
  registroPct: number;
  reformaMaoDeObra: number;
  reformaMaterial: number;

  // Custos de aquisição — não dedutíveis
  assessoriaPct: number;
  dividaPropterRem: number;

  // Custos de venda
  corretorVendaPct: number; // dedutível
  assessoriaVendaPct: number; // não dedutível

  // Débitos assumidos na arrematação (pontuais, já existentes no imóvel)
  desocupacao: number;
  gravames: number;
  outrosCustos: number;
  iptuArrematante: number;
  condominioArrematante: number;
  outrosDebitos: number;

  // Custos de manutenção durante o período até a revenda
  iptuMensal: number;
  condominioMensal: number;

  modoIR: ModoImpostoRenda;
  irManual: number;

  // Custo de oportunidade: quanto o capital exposto ao negócio renderia se
  // investido a essa taxa (ex: CDI) durante o mesmo período, em vez de ficar
  // parado na operação.
  taxaOportunidadeAnual: number;
};

export const DEFAULT_CUSTOS: Omit<CustosRegularizacao, "valorArrematacao" | "valorVenda"> = {
  periodoRevendaMeses: 12,
  modalidadePagamento: "avista",
  percentualEntrada: 20,
  escrituraPct: 2,
  itbiPct: 3,
  registroPct: 2,
  reformaMaoDeObra: 0,
  reformaMaterial: 0,
  assessoriaPct: 0,
  dividaPropterRem: 0,
  corretorVendaPct: 6,
  assessoriaVendaPct: 0,
  desocupacao: 0,
  gravames: 0,
  outrosCustos: 0,
  iptuArrematante: 0,
  condominioArrematante: 0,
  outrosDebitos: 0,
  iptuMensal: 0,
  condominioMensal: 0,
  modoIR: "auto",
  irManual: 0,
  taxaOportunidadeAnual: 10,
};

export type ResultadoRevenda = {
  escrituraRS: number;
  itbiRS: number;
  registroRS: number;
  assessoriaAquisicaoRS: number;
  corretagemVendaRS: number;
  assessoriaVendaRS: number;
  custosAquisicaoDedutiveis: number;
  custosAquisicaoNaoDedutiveis: number;
  custosVendaDedutiveis: number;
  custosVendaNaoDedutiveis: number;
  totalDebitosPontuais: number;
  custoMensalTotal: number;
  entrada: number;
  exposicaoDeCaixa: number;
  perdaRentabilidade: number;
  custoTotal: number;
  ganhoCapitalTributavel: number;
  impostoRenda: number;
  lucroLiquido: number;
  roi: number;
  roiAnualizado: number;
};

// Base de ganho de capital tributável segue a regra da Receita Federal: preço
// de venda menos o custo de aquisição e apenas os custos que a lei permite
// deduzir (corretagem, ITBI, escritura, registro, benfeitorias) — assessoria,
// dívidas propter rem e débitos assumidos não entram nessa base.
export function calcRevenda(c: CustosRegularizacao): ResultadoRevenda {
  const escrituraRS = (c.escrituraPct / 100) * c.valorArrematacao;
  const itbiRS = (c.itbiPct / 100) * c.valorArrematacao;
  const registroRS = (c.registroPct / 100) * c.valorArrematacao;
  const assessoriaAquisicaoRS = (c.assessoriaPct / 100) * c.valorArrematacao;
  const corretagemVendaRS = (c.corretorVendaPct / 100) * c.valorVenda;
  const assessoriaVendaRS = (c.assessoriaVendaPct / 100) * c.valorVenda;

  const custosAquisicaoDedutiveis = escrituraRS + itbiRS + registroRS + c.reformaMaoDeObra + c.reformaMaterial;
  const custosAquisicaoNaoDedutiveis = assessoriaAquisicaoRS + c.dividaPropterRem;
  const custosVendaDedutiveis = corretagemVendaRS;
  const custosVendaNaoDedutiveis = assessoriaVendaRS;

  const totalDebitosPontuais = c.desocupacao + c.gravames + c.outrosCustos + c.iptuArrematante + c.condominioArrematante + c.outrosDebitos;
  const custoMensalTotal = (c.iptuMensal + c.condominioMensal) * Math.max(0, c.periodoRevendaMeses);

  const entrada =
    c.modalidadePagamento === "avista"
      ? c.valorArrematacao
      : c.valorArrematacao * (Math.min(100, Math.max(0, c.percentualEntrada)) / 100);
  const exposicaoDeCaixa = entrada + custosAquisicaoDedutiveis + custosAquisicaoNaoDedutiveis + totalDebitosPontuais + custoMensalTotal;

  const anos = Math.max(0, c.periodoRevendaMeses) / 12;
  const perdaRentabilidade = exposicaoDeCaixa * (Math.pow(1 + c.taxaOportunidadeAnual / 100, anos) - 1);

  const baseDedutivel = c.valorArrematacao + custosAquisicaoDedutiveis + custosVendaDedutiveis;
  const ganhoCapitalTributavel = Math.max(0, c.valorVenda - baseDedutivel);
  const irAuto = ganhoCapitalTributavel * 0.15;
  const impostoRenda = c.modoIR === "manual" ? Math.max(0, c.irManual) : irAuto;

  // custoTotal soma TODOS os custos, incluindo o IR — é o "total desembolso"
  // exibido no resumo, e a soma de cada linha ali deve bater com esse total.
  const custoTotal =
    c.valorArrematacao +
    custosAquisicaoDedutiveis +
    custosAquisicaoNaoDedutiveis +
    custosVendaDedutiveis +
    custosVendaNaoDedutiveis +
    totalDebitosPontuais +
    custoMensalTotal +
    perdaRentabilidade +
    impostoRenda;

  const lucroLiquido = c.valorVenda - custoTotal;
  const roi = exposicaoDeCaixa > 0 ? (lucroLiquido / exposicaoDeCaixa) * 100 : 0;
  const meses = Math.max(1, c.periodoRevendaMeses);
  const roiAnualizado = (Math.pow(1 + roi / 100, 12 / meses) - 1) * 100;

  return {
    escrituraRS,
    itbiRS,
    registroRS,
    assessoriaAquisicaoRS,
    corretagemVendaRS,
    assessoriaVendaRS,
    custosAquisicaoDedutiveis,
    custosAquisicaoNaoDedutiveis,
    custosVendaDedutiveis,
    custosVendaNaoDedutiveis,
    totalDebitosPontuais,
    custoMensalTotal,
    entrada,
    exposicaoDeCaixa,
    perdaRentabilidade,
    custoTotal,
    ganhoCapitalTributavel,
    impostoRenda,
    lucroLiquido,
    roi,
    roiAnualizado: isFinite(roiAnualizado) ? roiAnualizado : 0,
  };
}
