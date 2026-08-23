export type Modalidade = "Judicial" | "Extrajudicial";

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
