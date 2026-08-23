import { NextRequest, NextResponse } from "next/server";
import { criarImovel, listImoveis } from "@/lib/imoveis-service";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const payload = await listImoveis({
      estado: sp.get("estado") || undefined,
      tipo: sp.get("tipo") || undefined,
    });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.tipo || !body.endereco || !body.cidade || !body.estado || !body.link) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }
    const imovel = await criarImovel(body);
    return NextResponse.json(imovel, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
