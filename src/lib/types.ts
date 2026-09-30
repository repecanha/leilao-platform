export type Modalidade = "Judicial" | "Extrajudicial";

export const ETAPAS_PIPELINE = [
  "nao_iniciada",
  "financeiro",
  "mercadologico",
  "juridico",
  "aprovado",
  "cadastro",
  "arrematado",
  "nao_arrematado",
  "reprovado",
] as const;
export type EtapaPipeline = (typeof ETAPAS_PIPELINE)[number];
export const ETAPA_LABEL: Record<EtapaPipeline, string> = {
  nao_iniciada: "Não iniciada",
  financeiro: "Financeiro",
  mercadologico: "Mercadológico",
  juridico: "Jurídico",
  aprovado: "Aprovado",
  cadastro: "Cadastro",
  arrematado: "Arrematado",
  nao_arrematado: "Não arrematado",
  reprovado: "Reprovado",
};

export type Imovel = {
  id: string;
  fonte: string;
  tipo: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  area: number;
  quartos: number;
  vaga: boolean;
  avaliacao: number;
  lance_minimo: number;
  modalidade: Modalidade | string;
  leiloeiro: string;
  data_leilao: string | null;
  status: string;
  ocupado: boolean;
  matricula: string;
  link: string;
  foto: string | null;
  pendencias: string[];
  desconto: number;
  lat?: number;
  lng?: number;
  pipelineEtapa: EtapaPipeline;
  precoArrematado: number | null;
};

export const CATEGORIAS_LANCAMENTO = [
  "parcela_arrematacao",
  "reforma",
  "cartorio",
  "itbi",
  "condominio",
  "iptu",
  "advogado",
  "corretor",
  "imposto_renda",
  "receita_venda",
  "outras_despesas",
  "outras_receitas",
] as const;
export type CategoriaLancamento = (typeof CATEGORIAS_LANCAMENTO)[number];
export const CATEGORIA_LABEL: Record<CategoriaLancamento, string> = {
  parcela_arrematacao: "Parcela da arrematação",
  reforma: "Reforma",
  cartorio: "Cartório",
  itbi: "ITBI",
  condominio: "Condomínio",
  iptu: "IPTU",
  advogado: "Advogado",
  corretor: "Corretor",
  imposto_renda: "Imposto de renda",
  receita_venda: "Receita de venda",
  outras_despesas: "Outras despesas",
  outras_receitas: "Outras receitas",
};
// Categorias que representam entrada de caixa (receita); todo o resto é despesa.
export const CATEGORIAS_RECEITA: CategoriaLancamento[] = ["receita_venda", "outras_receitas"];

export type Lancamento = {
  id: string;
  imovelId: string;
  data: string;
  categoria: CategoriaLancamento;
  descricao: string;
  valor: number;
  criadoEm: string;
};

export type ImoveisQuery = {
  estado?: string;
  cidade?: string;
  tipo?: string;
  minDesconto?: number;
  maxLance?: number;
  fonte?: string;
  page?: number;
  limit?: number;
};

export type ImoveisResponse = {
  source: "db" | "apify" | "mock";
  total: number;
  page: number;
  limit: number;
  imoveis: Imovel[];
};

export type ViabilidadeConfig = {
  financiamento: boolean;
  taxa_juros: number;
  prazo: number;
  aluguel_esperado: number;
  custo_reforma: number;
  custo_pendencias: number;
};

export type Viabilidade = {
  parc: number;
  fc: number;
  yb: number;
  yl: number;
  gc: number;
  roi: number;
  pb: number;
  score: number;
  total: number;
  despesas: number;
};
