import { NextRequest, NextResponse } from "next/server";
import { listImoveis } from "@/lib/imoveis-service";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const payload = await listImoveis({
      estado: sp.get("estado") || undefined,
      cidade: sp.get("cidade") || undefined,
      tipo: sp.get("tipo") || undefined,
      minDesconto: sp.has("minDesconto") ? Number(sp.get("minDesconto")) : undefined,
      maxLance: sp.has("maxLance") ? Number(sp.get("maxLance")) : undefined,
      fonte: sp.get("fonte") || undefined,
      page: sp.has("page") ? Number(sp.get("page")) : undefined,
      limit: sp.has("limit") ? Number(sp.get("limit")) : undefined,
    });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
