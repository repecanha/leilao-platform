export type CustosRegularizacao = {
  valorArrematacao: number;
  valorVenda: number;
  quitacaoFinanciamento: number;
  escrituraPct: number;
  itbiPct: number;
  registroPct: number;
  assessoriaPct: number;
  corretorVendaPct: number;
  desocupacao: number;
  gravames: number;
  outrosCustos: number;
  iptuArrematante: number;
  condominioArrematante: number;
  outrosDebitos: number;
  irPct: number;
};

export const DEFAULT_CUSTOS: Omit<CustosRegularizacao, "valorArrematacao" | "valorVenda"> = {
  quitacaoFinanciamento: 0,
  escrituraPct: 2,
  itbiPct: 3,
  registroPct: 2,
  assessoriaPct: 0,
  corretorVendaPct: 6,
  desocupacao: 0,
  gravames: 0,
  outrosCustos: 0,
  iptuArrematante: 0,
  condominioArrematante: 0,
  outrosDebitos: 0,
  irPct: 15,
};

export type ResultadoRevenda = {
  escrituraRS: number;
  itbiRS: number;
  registroRS: number;
  assessoriaRS: number;
  corretagemVenda: number;
  totalDebitos: number;
  reposicaoDeCaixa: number;
  saldo: number;
  lucroBruto: number;
  impostoRenda: number;
  lucroLiquido: number;
  roiSobreDesembolso: number;
};

export function calcRevenda(c: CustosRegularizacao): ResultadoRevenda {
  const escrituraRS = (c.escrituraPct / 100) * c.valorArrematacao;
  const itbiRS = (c.itbiPct / 100) * c.valorArrematacao;
  const registroRS = (c.registroPct / 100) * c.valorArrematacao;
  const assessoriaRS = (c.assessoriaPct / 100) * c.valorArrematacao;
  const corretagemVenda = (c.corretorVendaPct / 100) * c.valorVenda;

  const totalDebitos = c.iptuArrematante + c.condominioArrematante + c.outrosDebitos;

  const reposicaoDeCaixa =
    c.valorArrematacao +
    escrituraRS +
    itbiRS +
    registroRS +
    assessoriaRS +
    c.desocupacao +
    c.gravames +
    c.outrosCustos +
    totalDebitos;

  const saldo = c.valorVenda - c.quitacaoFinanciamento;
  const lucroBruto = saldo - reposicaoDeCaixa - corretagemVenda;
  const impostoRenda = Math.max(0, lucroBruto) * (c.irPct / 100);
  const lucroLiquido = lucroBruto - impostoRenda;
  const roiSobreDesembolso = reposicaoDeCaixa > 0 ? (lucroLiquido / reposicaoDeCaixa) * 100 : 0;

  return {
    escrituraRS,
    itbiRS,
    registroRS,
    assessoriaRS,
    corretagemVenda,
    totalDebitos,
    reposicaoDeCaixa,
    saldo,
    lucroBruto,
    impostoRenda,
    lucroLiquido,
    roiSobreDesembolso,
  };
}
