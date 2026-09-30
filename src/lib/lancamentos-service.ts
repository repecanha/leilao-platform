import "server-only";
import { getSupabase, getSupabaseAdmin } from "./supabase";
import { CategoriaLancamento, Lancamento } from "./types";

function linhaParaLancamento(row: Record<string, unknown>): Lancamento {
  return {
    id: String(row.id),
    imovelId: String(row.imovel_id),
    data: String(row.data),
    categoria: row.categoria as CategoriaLancamento,
    descricao: String(row.descricao ?? ""),
    valor: Number(row.valor) || 0,
    criadoEm: String(row.criado_em ?? ""),
  };
}

export async function listLancamentos(imovelId: string): Promise<Lancamento[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("imovel_id", imovelId)
    .order("data", { ascending: true });

  if (error || !data) return [];
  return data.map(linhaParaLancamento);
}

export type NovoLancamentoInput = {
  data: string;
  categoria: CategoriaLancamento;
  descricao?: string;
  valor: number;
};

export async function criarLancamento(imovelId: string, input: NovoLancamentoInput): Promise<Lancamento> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase admin não configurado");

  const { data, error } = await admin
    .from("lancamentos")
    .insert({
      id: crypto.randomUUID(),
      imovel_id: imovelId,
      data: input.data,
      categoria: input.categoria,
      descricao: input.descricao ?? "",
      valor: input.valor,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return linhaParaLancamento(data);
}

export async function excluirLancamento(id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase admin não configurado");
  const { error } = await admin.from("lancamentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
