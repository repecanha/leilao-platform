import { XMLParser } from "fast-xml-parser";
import crypto from "crypto";

export type NoticiaItem = {
  id: string;
  fonte: string;
  titulo: string;
  resumo: string;
  link: string;
  publicadoEm: string | null;
  imagemUrl: string | null;
};

type TipoFonte = "institucional" | "imprensa";
type Fonte = { nome: string; url: string; tipo: TipoFonte };

// Mesmas fontes públicas de RSS usadas por agregadores do setor (ex: página
// de notícias do M2Certo): institucionais entram por completo, imprensa
// generalista é filtrada por palavra-chave. RSS é feito para redistribuição
// de título/resumo/link — por isso não gravamos texto completo das matérias
// de imprensa, só resumo curto + link "leia a matéria completa" na fonte.
const FONTES: Fonte[] = [
  { nome: "SECOVI-SP", url: "https://secovi.com.br/feed/", tipo: "institucional" },
  { nome: "CBIC", url: "https://cbic.org.br/feed/", tipo: "institucional" },
  // Feed de tag dedicado a mercado imobiliário — já 100% no assunto, sem
  // precisar do filtro de palavra-chave (confirmado inspecionando os títulos).
  { nome: "InfoMoney", url: "https://www.infomoney.com.br/tudo-sobre/mercado-imobiliario/feed/", tipo: "institucional" },
  { nome: "Folha de S.Paulo", url: "https://feeds.folha.uol.com.br/mercado/rss091.xml", tipo: "imprensa" },
  { nome: "Valor Econômico", url: "https://valor.globo.com/rss/valor/", tipo: "imprensa" },
  { nome: "Exame", url: "https://exame.com/feed/", tipo: "imprensa" },
  { nome: "UOL Economia", url: "https://rss.uol.com.br/feed/economia.xml", tipo: "imprensa" },
  { nome: "Estadão", url: "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/economia/", tipo: "imprensa" },
  { nome: "Brazil Journal", url: "https://braziljournal.com/feed/", tipo: "imprensa" },
  { nome: "Money Times", url: "https://www.moneytimes.com.br/feed/", tipo: "imprensa" },
];

const PALAVRAS_CHAVE = [
  "imob", "imóve", "imove", "imóvel", "imovel",
  "construção civil", "construtora", "incorporador", "incorporadora",
  "aluguel", "locação", "loteamento", "condomín",
  "minha casa minha vida", "financiamento imobiliário",
  "leilão de imóve", "vgv", "cub ", "selic",
  "ifix", " fii", "fundo imobiliário", "fundos imobiliários",
];

const MAX_POR_FONTE = 30;
const LIMITE_RESUMO = 280;
const REVALIDATE_SEGUNDOS = 3600;
export const TAG_NOTICIAS = "noticias";

function bateComPalavraChave(texto: string): boolean {
  const alvo = texto.toLowerCase();
  return PALAVRAS_CHAVE.some((p) => alvo.includes(p));
}

const ENTIDADES_NOMEADAS: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
};

function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, nome) => ENTIDADES_NOMEADAS[nome] ?? m);
}

function limparHtml(texto: unknown): string {
  if (typeof texto !== "string" || !texto) return "";
  const semTags = texto.replace(/<[^>]+>/g, " ");
  const decodificado = decodificarEntidades(semTags);
  return decodificado.replace(/\s+/g, " ").trim();
}

function resumir(texto: unknown, limite = LIMITE_RESUMO): string {
  const limpo = limparHtml(texto);
  if (limpo.length <= limite) return limpo;
  const cortado = limpo.slice(0, limite);
  const ultimoEspaco = cortado.lastIndexOf(" ");
  return (ultimoEspaco > 0 ? cortado.slice(0, ultimoEspaco) : cortado) + "…";
}

function gerarId(link: string): string {
  return crypto.createHash("sha1").update(link).digest("hex").slice(0, 12);
}

function extrairLink(campo: unknown): string {
  if (typeof campo === "string") return campo;
  if (Array.isArray(campo)) {
    const alternate = campo.find((l) => !l["@_rel"] || l["@_rel"] === "alternate");
    return alternate?.["@_href"] ?? campo[0]?.["@_href"] ?? "";
  }
  if (campo && typeof campo === "object") {
    return (campo as Record<string, string>)["@_href"] ?? "";
  }
  return "";
}

function primeiraTag<T = Record<string, unknown>>(campo: unknown): T | null {
  if (!campo) return null;
  return (Array.isArray(campo) ? campo[0] : campo) as T;
}

// Imagem da matéria: tenta, nesta ordem, o <enclosure> padrão RSS, o
// namespace Media RSS (<media:content>/<media:thumbnail>, comum em feeds
// WordPress) e, por fim, a primeira <img> dentro do HTML do conteúdo/resumo.
function extrairImagem(entry: Record<string, unknown>): string | null {
  const enclosure = primeiraTag<Record<string, string>>(entry.enclosure);
  if (enclosure?.["@_url"] && (!enclosure["@_type"] || enclosure["@_type"].startsWith("image"))) {
    return enclosure["@_url"];
  }

  const media = primeiraTag<Record<string, string>>(entry["media:content"] ?? entry["media:thumbnail"]);
  if (media?.["@_url"]) return media["@_url"];

  const conteudo = (entry["content:encoded"] ?? entry.description ?? entry.summary ?? entry.content) as
    | string
    | undefined;
  if (typeof conteudo === "string") {
    const match = conteudo.match(/<img[^>]+src=["']([^"'\s]+)["']/i);
    if (match) return match[1];
  }

  return null;
}

function parseData(entry: Record<string, unknown>): string | null {
  const bruto = (entry.pubDate ?? entry.published ?? entry.updated ?? entry["dc:date"]) as string | undefined;
  if (!bruto) return null;
  const data = new Date(bruto);
  return isNaN(data.getTime()) ? null : data.toISOString();
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

// Alguns feeds brasileiros ainda declaram ISO-8859-1/Windows-1252 em vez de
// UTF-8 — às vezes só no header HTTP (ex: UOL: "Content-Type: text/xml;
// charset=ISO-8859-1", sem declaração no próprio XML), às vezes só na
// declaração <?xml ... encoding="..."?> (ex: Folha). `fetch().text()` sempre
// decodifica como UTF-8, então lemos os bytes crus e checamos as duas fontes
// antes de decodificar — senão acentos viram caracteres corrompidos.
async function decodificarXml(res: Response): Promise<string> {
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const charsetHeader = res.headers.get("content-type")?.match(/charset=([^;]+)/i)?.[1];
  const preview = new TextDecoder("ascii").decode(bytes.slice(0, 200));
  const charsetXml = preview.match(/encoding=["']([^"']+)["']/i)?.[1];
  const charset = (charsetHeader ?? charsetXml ?? "utf-8").trim().toLowerCase();
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function buscarFonte(fonte: Fonte): Promise<NoticiaItem[]> {
  try {
    const res = await fetch(fonte.url, {
      headers: { "User-Agent": "RadarLeiloesBot/1.0 (agregador de noticias do setor imobiliario)" },
      next: { revalidate: REVALIDATE_SEGUNDOS, tags: [TAG_NOTICIAS] },
    });
    if (!res.ok) {
      console.warn(`[noticias] ${fonte.nome}: HTTP ${res.status}`);
      return [];
    }
    const xml = await decodificarXml(res);
    const data = parser.parse(xml);

    const canalRss = data?.rss?.channel?.item;
    const entradasAtom = data?.feed?.entry;
    const bruto = canalRss ?? entradasAtom ?? [];
    const entradas: Record<string, unknown>[] = Array.isArray(bruto) ? bruto : [bruto];

    const itens: NoticiaItem[] = [];
    for (const entry of entradas.slice(0, MAX_POR_FONTE)) {
      const titulo = limparHtml(entry.title);
      const link = extrairLink(entry.link);
      const resumoBruto = entry.description ?? entry.summary ?? entry["content:encoded"] ?? entry.content;

      if (!titulo || !link) continue;

      if (fonte.tipo === "imprensa" && !bateComPalavraChave(titulo + " " + limparHtml(resumoBruto))) {
        continue;
      }

      itens.push({
        id: gerarId(link),
        fonte: fonte.nome,
        titulo,
        resumo: resumir(resumoBruto),
        link,
        publicadoEm: parseData(entry),
        imagemUrl: extrairImagem(entry),
      });
    }
    return itens;
  } catch (err) {
    console.warn(`[noticias] falha ao buscar ${fonte.nome}:`, err);
    return [];
  }
}

export async function getNoticias(): Promise<NoticiaItem[]> {
  const resultados = await Promise.all(FONTES.map(buscarFonte));
  const vistos = new Set<string>();
  const todos: NoticiaItem[] = [];

  for (const itens of resultados) {
    for (const item of itens) {
      if (vistos.has(item.id)) continue;
      vistos.add(item.id);
      todos.push(item);
    }
  }

  todos.sort((a, b) => (b.publicadoEm ?? "").localeCompare(a.publicadoEm ?? ""));
  return todos;
}

export const FONTES_NOTICIAS = FONTES.map((f) => f.nome);
