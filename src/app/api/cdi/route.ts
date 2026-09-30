import { NextResponse } from "next/server";
import { cdiAcumulado } from "@/lib/bcb";

// Retorna o CDI acumulado dos últimos 12 meses como referência de "taxa
// livre de risco" para custo de oportunidade — usado como valor inicial
// sugerido nas calculadoras (o usuário pode sempre ajustar).
export async function GET() {
  const hoje = new Date();
  const umAnoAtras = new Date(hoje);
  umAnoAtras.setFullYear(hoje.getFullYear() - 1);
  const paraIso = (d: Date) => d.toISOString().slice(0, 10);

  const acumulado = await cdiAcumulado(paraIso(umAnoAtras), paraIso(hoje));
  return NextResponse.json({ taxaAnual: acumulado ?? 10 });
}
