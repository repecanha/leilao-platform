import { NextResponse } from "next/server";
import { criarLancamento, listLancamentos } from "@/lib/lancamentos-service";
import { CATEGORIAS_LANCAMENTO } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lancamentos = await listLancamentos(id);
    return NextResponse.json({ lancamentos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.data || !body.categoria || typeof body.valor !== "number") {
      return NextResponse.json({ error: "Informe data, categoria e valor" }, { status: 400 });
    }
    if (!CATEGORIAS_LANCAMENTO.includes(body.categoria)) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const lancamento = await criarLancamento(id, {
      data: body.data,
      categoria: body.categoria,
      descricao: body.descricao,
      valor: body.valor,
    });
    return NextResponse.json(lancamento, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
