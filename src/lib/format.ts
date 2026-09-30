export const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export const fmtN = (v: number, d = 1) => (isFinite(v) ? v.toFixed(d).replace(".", ",") : "N/A");

export const diasAte = (d: string | null) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
};

export const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (v >= 1_000) return `R$${Math.round(v / 1000)} mil`;
  return fmt(v);
};

export const fmtData = (d: string | null) => {
  if (!d) return "A definir";
  // Datas "somente data" (yyyy-mm-dd, ex: data_leilao, lançamentos do livro
  // caixa) são interpretadas pelo Date() como UTC meia-noite; formatá-las no
  // fuso local pode voltar um dia. Para essas, monta o Date a partir dos
  // componentes locais em vez de fazer o round-trip por UTC.
  const somenteData = /^\d{4}-\d{2}-\d{2}$/.test(d);
  const data = somenteData
    ? new Date(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)))
    : new Date(d);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};
