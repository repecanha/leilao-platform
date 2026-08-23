import { Imovel, Viabilidade, ViabilidadeConfig } from "./types";

export function calcViab(im: Imovel, cfg: ViabilidadeConfig): Viabilidade {
  const { financiamento, taxa_juros, prazo, aluguel_esperado, custo_reforma, custo_pendencias } = cfg;
  const lance = im.lance_minimo;
  const fin = financiamento ? lance * 0.8 : 0;
  const tm = taxa_juros / 100 / 12;
  const parc = fin > 0 ? (fin * tm * Math.pow(1 + tm, prazo)) / (Math.pow(1 + tm, prazo) - 1) : 0;
  const total = lance + custo_reforma + custo_pendencias;
  const despesas = parc + (im.tipo === "Apartamento" || im.tipo === "Kitnet" ? 600 : 200) + total * 0.001;
  const fc = aluguel_esperado - despesas;
  const yb = (aluguel_esperado * 12) / lance * 100;
  const yl = (fc * 12) / total * 100;
  const gc = im.avaliacao - total;
  const roi = (gc / total) * 100;
  const pb = fc > 0 ? total / fc / 12 : 999;
  const score = Math.min(
    100,
    Math.max(
      0,
      (im.desconto / 60) * 30 +
        (yl > 6 ? 25 : yl > 4 ? 15 : 5) +
        (im.ocupado ? -10 : 10) +
        (im.pendencias.length === 0 ? 15 : im.pendencias.length === 1 ? 8 : 0) +
        (im.modalidade === "Extrajudicial" ? 10 : 5) +
        (roi > 30 ? 10 : roi > 15 ? 5 : 0)
    )
  );
  return { parc, fc, yb, yl, gc, roi, pb, score, total, despesas };
}

export const DEFAULT_VIAB_CONFIG: ViabilidadeConfig = {
  financiamento: false,
  taxa_juros: 11,
  prazo: 360,
  aluguel_esperado: 2500,
  custo_reforma: 15000,
  custo_pendencias: 0,
};
