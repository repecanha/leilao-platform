import { Imovel } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return 0;
  return parseFloat(v.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) || 0;
};

export function normalizar(raw: Raw, fonte: string): Imovel {
  if (fonte === "caixa") {
    const avaliacao = num(raw.valorAvaliacao);
    const lanceMinimo = num(raw.valorMinimoPrimeiraFase) || num(raw.valorMinimo);
    return {
      id: String(raw.id ?? raw.numeroImovel),
      fonte: "Caixa",
      tipo: raw.tipoImovel || "Imóvel",
      endereco: raw.endereco || "",
      bairro: raw.bairro || "",
      cidade: raw.cidade || "",
      estado: raw.estado || "",
      area: num(raw.areaTotal),
      quartos: parseInt(raw.dormitorios) || 0,
      vaga: raw.vagasGaragem > 0,
      avaliacao,
      lance_minimo: lanceMinimo,
      modalidade: raw.modalidadeVenda || "Extrajudicial",
      leiloeiro: "Caixa",
      data_leilao: raw.dataFimLicitacao || raw.dataLeilao || null,
      status: raw.situacao || "Ativo",
      ocupado: raw.ocupado === "Sim",
      matricula: raw.matricula || "",
      link: raw.linkDetalhe || `https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnOrigem=index&hdnimovel=${raw.id}`,
      foto: raw.foto || null,
      pendencias: raw.pendencias || [],
      desconto: avaliacao > 0 ? Math.round((1 - lanceMinimo / avaliacao) * 100) : 0,
    };
  }

  // "leilaoimovel" (agregador leilaoimovel.com.br via ator gio21/leilaoimovel-scraper).
  // Schema CONFIRMADO rodando o ator de verdade com token real (ago/2026):
  //   { index, title, address, modalities[], price, appraisal, discount, discountText,
  //     closingDate, tag, image, url, page }
  // É uma raspagem em nível de LISTAGEM — não traz bairro/área/quartos/vaga/matrícula
  // estruturados nem lat/lng, só o que dá pra extrair do título/endereço em texto livre.
  if (fonte === "leilaoimovel") {
    const avaliacao = num(raw.appraisal);
    const lanceMinimo = num(raw.price);
    const { tipo, banco, cidade, estado } = parseTituloLeilaoImovel(raw.title || "");
    const bairro = parseBairro(raw.address || "");
    const modalidade = Array.isArray(raw.modalities) && raw.modalities.some((m: string) => /judicial/i.test(m))
      ? "Judicial"
      : "Extrajudicial";
    const id = extrairIdDaUrl(raw.url) ?? String(raw.index ?? raw.url ?? crypto.randomUUID());

    return {
      id,
      fonte: banco,
      tipo,
      endereco: raw.address || raw.title || "",
      bairro,
      cidade,
      estado,
      area: 0,
      quartos: 0,
      vaga: false,
      avaliacao,
      lance_minimo: lanceMinimo,
      modalidade,
      leiloeiro: banco,
      data_leilao: parseDataEncerramento(raw.closingDate),
      status: "Ativo",
      ocupado: false,
      matricula: "",
      link: raw.url || "#",
      foto: raw.image || null,
      pendencias: [],
      desconto:
        typeof raw.discount === "number"
          ? Math.round(raw.discount)
          : avaliacao > 0
            ? Math.round((1 - lanceMinimo / avaliacao) * 100)
            : 0,
    };
  }

  return { ...raw, fonte, leiloeiro: fonte } as Imovel;
}

const BANCOS_CONHECIDOS = ["Caixa", "Santander", "Itaú", "Itau", "Bradesco", "Banco do Brasil"];

// title ex.: "Casa Caixa em Tietê / SP - 2969972"
// Cidades com artigo (Rio De Janeiro, ...) usam "no"/"na" em vez de "em".
function parseTituloLeilaoImovel(title: string) {
  const tipo = title.split(" ")[0] || "Imóvel";
  const banco = BANCOS_CONHECIDOS.find((b) => title.includes(b)) || "Leilão Imóvel";
  const m = title.match(/\b(?:em|no|na|nos|nas)\s+(.+?)\s*\/\s*([A-Z]{2})/i);
  return { tipo, banco, cidade: m?.[1]?.trim() || "", estado: m?.[2]?.toUpperCase() || "" };
}

// address ex.: "RUA X,N. 514, TERRAS DE SANTA MARIA - CEP: 18530-322, TIETE - SAO PAULO"
function parseBairro(address: string): string {
  const parts = address.split(",");
  return parts[2]?.split(" - CEP")[0]?.trim() || "";
}

// closingDate ex.: "Encerra em: 13/08/2026 18:00"
function parseDataEncerramento(closingDate: string | undefined): string | null {
  const m = closingDate?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

// url ex.: ".../imovel-caixa-economica-federal-cef-2969972-8444401445110-venda-direta-caixa"
// os códigos numéricos longos no final da URL identificam o imóvel de forma estável.
function extrairIdDaUrl(url: string | undefined): string | null {
  if (!url) return null;
  const matches = url.match(/\d{6,}/g);
  return matches ? matches[matches.length - 1] : null;
}
