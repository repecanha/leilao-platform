import "server-only";
import { ApifyClient } from "apify-client";
import NodeCache from "node-cache";
import { normalizar } from "./normalize";
import { MOCK_IMOVEIS } from "./mock";
import { getSupabase } from "./supabase";
import { Imovel, ImoveisQuery, ImoveisResponse } from "./types";

const cache = new NodeCache({ stdTTL: 3600 });
// Índice auxiliar: como o ator "leilaoimovel" não tem busca por ID, guardamos aqui
// todo imóvel visto numa listagem recente para que a ficha (getImovel) funcione
// quando não há banco (Supabase) configurado.
const idIndex = new NodeCache({ stdTTL: 3600 * 6 });

// Atores verificados no Apify Store (agosto/2026) com o token real do usuário.
// "leilaoimovel" (gio21/leilaoimovel-scraper) cobre Caixa + Santander + Itaú +
// Bradesco + Banco do Brasil num único scraper. Schema real confirmado rodando o
// ator: input { state, city, propertyType, maxItems, minDiscount }, output
// { title, address, modalities[], price, appraisal, discount, discountText,
//   closingDate, tag, image, url, page } — só 1 estado por chamada, sem busca por ID.
//
// Esta é a fonte usada SÓ pela rota de ingestão (/api/cron/ingest), que roda fora do
// ciclo de requisição do usuário e grava no Supabase. listImoveis/getImovel abaixo
// leem do Supabase primeiro (rápido); só caem para scrape ao vivo se o banco não
// estiver configurado.
const ACTOR_LEILAOIMOVEL = "gio21/leilaoimovel-scraper";
const DEFAULT_FONTE = "leilaoimovel";

function getApify(): ApifyClient | null {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;
  return new ApifyClient({ token });
}

function applyFilters(imoveis: Imovel[], q: ImoveisQuery): Imovel[] {
  let out = imoveis;
  if (q.estado) out = out.filter((i) => i.estado === q.estado);
  if (q.cidade) out = out.filter((i) => i.cidade.toLowerCase().includes(q.cidade!.toLowerCase()));
  if (q.tipo) out = out.filter((i) => i.tipo === q.tipo);
  if (q.maxLance) out = out.filter((i) => i.lance_minimo <= q.maxLance!);
  const minDesconto = q.minDesconto ?? 0;
  out = out.filter((i) => i.desconto >= minDesconto);
  return out;
}

const emVoo = new Map<string, Promise<Imovel[]>>();

async function executarApify(estado: string, minDesconto: number): Promise<Imovel[]> {
  const apify = getApify();
  if (!apify) return [];
  const run = await apify
    .actor(ACTOR_LEILAOIMOVEL)
    .call({ state: estado, maxItems: 40, minDiscount: minDesconto }, { timeout: 90 });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  const imoveis = items.map((i) => normalizar(i, DEFAULT_FONTE));
  for (const im of imoveis) idIndex.set(im.id, im);
  return imoveis;
}

// Busca ao vivo no Apify com de-duplicação: chamadas concorrentes com os mesmos
// parâmetros reaproveitam a mesma Promise em vez de abrir uma run cada uma.
function buscarApifyAoVivo(estado: string, minDesconto: number): Promise<Imovel[]> {
  const chave = `${estado}:${minDesconto}`;
  const existente = emVoo.get(chave);
  if (existente) return existente;
  const promessa = executarApify(estado, minDesconto).finally(() => emVoo.delete(chave));
  emVoo.set(chave, promessa);
  return promessa;
}

function linhaParaImovel(row: Record<string, unknown>): Imovel {
  return {
    id: String(row.id),
    fonte: String(row.fonte),
    tipo: String(row.tipo),
    endereco: String(row.endereco),
    bairro: String(row.bairro),
    cidade: String(row.cidade),
    estado: String(row.estado),
    area: Number(row.area) || 0,
    quartos: Number(row.quartos) || 0,
    vaga: Boolean(row.vaga),
    avaliacao: Number(row.avaliacao) || 0,
    lance_minimo: Number(row.lance_minimo) || 0,
    modalidade: String(row.modalidade),
    leiloeiro: String(row.leiloeiro),
    data_leilao: (row.data_leilao as string) ?? null,
    status: String(row.status),
    ocupado: Boolean(row.ocupado),
    matricula: String(row.matricula ?? ""),
    link: String(row.link),
    foto: (row.foto as string) ?? null,
    pendencias: Array.isArray(row.pendencias) ? (row.pendencias as string[]) : [],
    desconto: Number(row.desconto) || 0,
    lat: row.lat != null ? Number(row.lat) : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
  };
}

export async function listImoveis(q: ImoveisQuery): Promise<ImoveisResponse> {
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const cacheKey = `imoveis_${JSON.stringify(q)}`;
  const cached = cache.get<ImoveisResponse>(cacheKey);
  if (cached) return cached;

  const supabase = getSupabase();
  let imoveis: Imovel[];
  let source: ImoveisResponse["source"];

  if (supabase) {
    let query = supabase.from("imoveis").select("*").gte("desconto", q.minDesconto ?? 0);
    if (q.estado) query = query.eq("estado", q.estado);
    if (q.cidade) query = query.ilike("cidade", `%${q.cidade}%`);
    if (q.tipo) query = query.eq("tipo", q.tipo);
    if (q.maxLance) query = query.lte("lance_minimo", q.maxLance);

    const { data, error } = await query.order("desconto", { ascending: false }).limit(500);
    if (error || !data) {
      // Banco configurado mas inacessível agora (ex: projeto Supabase pausado por
      // inatividade — já aconteceu). NUNCA cai pro scrape ao vivo aqui: isso rodaria
      // dentro do request de um usuário de verdade, é lento (~20-30s) e, sob tráfego
      // concorrente, é exatamente o que estourou o limite de memória do Apify antes.
      // Cai direto pro mock, rápido e seguro.
      console.error("Supabase indisponível, usando mock:", error?.message);
      imoveis = MOCK_IMOVEIS;
      source = "mock";
    } else {
      // data.length === 0 pode ser um resultado real e válido (filtro sem match) —
      // não injeta mock/apify por cima disso.
      imoveis = data.map(linhaParaImovel);
      source = "db";
    }
  } else {
    // Sem Supabase configurado (ex: rodando o repo do zero, sem setup) — conveniência
    // de desenvolvimento: tenta Apify ao vivo, senão mock.
    imoveis = await buscarFallback(q);
    source = imoveis === MOCK_IMOVEIS ? "mock" : "apify";
  }

  imoveis = applyFilters([...imoveis], q).sort((a, b) => b.desconto - a.desconto);

  const total = imoveis.length;
  const start = (page - 1) * limit;
  const paged = imoveis.slice(start, start + limit);

  const payload: ImoveisResponse = { source, total, page, limit, imoveis: paged };
  cache.set(cacheKey, payload);
  return payload;
}

async function buscarFallback(q: ImoveisQuery): Promise<Imovel[]> {
  const apify = getApify();
  if (!apify) return MOCK_IMOVEIS;
  try {
    return await buscarApifyAoVivo(q.estado || "SP", q.minDesconto ?? 0);
  } catch (err) {
    console.error("Apify falhou, usando mock:", err instanceof Error ? err.message : err);
    return MOCK_IMOVEIS;
  }
}

export async function getImovel(id: string): Promise<Imovel | null> {
  const cacheKey = `imovel_${id}`;
  const cached = cache.get<Imovel>(cacheKey);
  if (cached) return cached;

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from("imoveis").select("*").eq("id", id).maybeSingle();
    if (data) {
      const imovel = linhaParaImovel(data);
      cache.set(cacheKey, imovel, 7200);
      return imovel;
    }
  }

  const doIndice = idIndex.get<Imovel>(id);
  if (doIndice) {
    cache.set(cacheKey, doIndice, 7200);
    return doIndice;
  }

  const found = MOCK_IMOVEIS.find((i) => i.id === id) || null;
  if (found) cache.set(cacheKey, found, 7200);
  return found;
}
