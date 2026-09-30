import { NextResponse } from "next/server";
import { getImovel } from "@/lib/imoveis-service";
import { listLancamentos } from "@/lib/lancamentos-service";
import { resumirLivroCaixa } from "@/lib/livroCaixa";
import { cdiAcumulado } from "@/lib/bcb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [imovel, lancamentos] = await Promise.all([getImovel(id), listLancamentos(id)]);
    if (!imovel) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

    const desembolsoInicial = imovel.precoArrematado ?? imovel.lance_minimo;
    const resumo = resumirLivroCaixa(lancamentos, desembolsoInicial);
    const cdi = resumo.dataInicio ? await cdiAcumulado(resumo.dataInicio, resumo.dataFim) : null;

    return NextResponse.json({ lancamentos, resumo, cdiAcumulado: cdi });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
