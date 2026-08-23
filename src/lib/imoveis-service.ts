import "server-only";
import { getSupabase, getSupabaseAdmin } from "./supabase";
import { EtapaPipeline, Imovel, ImoveisQuery, ImoveisResponse } from "./types";

// Ferramenta pessoal de cadastro manual: cada imóvel é adicionado por você (com o
// link do leilão original) e acompanhado pelo pipeline. Não há mais busca/agregação
// automática — essa tabela só é escrita através das rotas abaixo.

function linhaParaImovel(row: Record<string, unknown>): Imovel {
  return {
    id: String(row.id),
    fonte: String(row.fonte ?? ""),
    tipo: String(row.tipo),
    endereco: String(row.endereco),
    bairro: String(row.bairro ?? ""),
    cidade: String(row.cidade),
    estado: String(row.estado),
    area: Number(row.area) || 0,
    quartos: Number(row.quartos) || 0,
    vaga: Boolean(row.vaga),
    avaliacao: Number(row.avaliacao) || 0,
    lance_minimo: Number(row.lance_minimo) || 0,
    modalidade: String(row.modalidade),
    leiloeiro: String(row.leiloeiro ?? ""),
    data_leilao: (row.data_leilao as string) ?? null,
    status: String(row.status ?? "Ativo"),
    ocupado: Boolean(row.ocupado),
    matricula: String(row.matricula ?? ""),
    link: String(row.link ?? "#"),
    foto: (row.foto as string) ?? null,
    pendencias: Array.isArray(row.pendencias) ? (row.pendencias as string[]) : [],
    desconto: Number(row.desconto) || 0,
    lat: row.lat != null ? Number(row.lat) : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
    pipelineEtapa: (row.pipeline_etapa as EtapaPipeline) ?? "nao_iniciada",
    precoArrematado: row.preco_arrematado != null ? Number(row.preco_arrematado) : null,
  };
}

export async function listImoveis(q: ImoveisQuery = {}): Promise<ImoveisResponse> {
  const supabase = getSupabase();
  if (!supabase) return { source: "mock", total: 0, page: 1, limit: 0, imoveis: [] };

  let query = supabase.from("imoveis").select("*");
  if (q.estado) query = query.eq("estado", q.estado);
  if (q.tipo) query = query.eq("tipo", q.tipo);

  const { data, error } = await query.order("criado_em", { ascending: false });
  if (error || !data) {
    console.error("Erro lendo imoveis do Supabase:", error?.message);
    return { source: "mock", total: 0, page: 1, limit: 0, imoveis: [] };
  }

  const imoveis = data.map(linhaParaImovel);
  return { source: "db", total: imoveis.length, page: 1, limit: imoveis.length, imoveis };
}

export async function getImovel(id: string): Promise<Imovel | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("imoveis").select("*").eq("id", id).maybeSingle();
  return data ? linhaParaImovel(data) : null;
}

export type NovoImovelInput = {
  tipo: string;
  endereco: string;
  bairro?: string;
  cidade: string;
  estado: string;
  area?: number;
  quartos?: number;
  vaga?: boolean;
  avaliacao: number;
  lance_minimo: number;
  modalidade: string;
  leiloeiro?: string;
  data_leilao?: string | null;
  link: string;
  foto?: string | null;
  pipeline_etapa?: EtapaPipeline;
};

export async function criarImovel(input: NovoImovelInput): Promise<Imovel | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase admin não configurado");

  const desconto =
    input.avaliacao > 0 ? Math.round((1 - input.lance_minimo / input.avaliacao) * 100) : 0;

  const { data, error } = await admin
    .from("imoveis")
    .insert({
      id: crypto.randomUUID(),
      tipo: input.tipo,
      endereco: input.endereco,
      bairro: input.bairro ?? "",
      cidade: input.cidade,
      estado: input.estado,
      area: input.area ?? 0,
      quartos: input.quartos ?? 0,
      vaga: input.vaga ?? false,
      avaliacao: input.avaliacao,
      lance_minimo: input.lance_minimo,
      modalidade: input.modalidade,
      leiloeiro: input.leiloeiro ?? "",
      data_leilao: input.data_leilao ?? null,
      link: input.link,
      foto: input.foto ?? null,
      desconto,
      pipeline_etapa: input.pipeline_etapa ?? "nao_iniciada",
      fonte: "Manual",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? linhaParaImovel(data) : null;
}

export type AtualizarImovelInput = Partial<NovoImovelInput> & {
  preco_arrematado?: number | null;
};

export async function atualizarImovel(id: string, input: AtualizarImovelInput): Promise<Imovel | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase admin não configurado");

  const patch: Record<string, unknown> = { ...input };
  if (input.avaliacao != null || input.lance_minimo != null) {
    const atual = await getImovel(id);
    const avaliacao = input.avaliacao ?? atual?.avaliacao ?? 0;
    const lance = input.lance_minimo ?? atual?.lance_minimo ?? 0;
    patch.desconto = avaliacao > 0 ? Math.round((1 - lance / avaliacao) * 100) : 0;
  }

  const { data, error } = await admin.from("imoveis").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data ? linhaParaImovel(data) : null;
}

export async function excluirImovel(id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase admin não configurado");
  const { error } = await admin.from("imoveis").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
