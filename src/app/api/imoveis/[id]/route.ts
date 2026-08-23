import { NextResponse } from "next/server";
import { getImovel } from "@/lib/imoveis-service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const imovel = await getImovel(id);
    if (!imovel) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    return NextResponse.json(imovel);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
