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
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};
