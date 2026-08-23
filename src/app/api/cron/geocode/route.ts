import { NextRequest, NextResponse } from "next/server";
import { preencherCoordenadasPendentes } from "@/lib/geocode";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Supabase admin não configurado" }, { status: 500 });

  const limit = Number(req.nextUrl.searchParams.get("limit") || 60);

  try {
    const resultado = await preencherCoordenadasPendentes(admin, limit);
    return NextResponse.json(resultado);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
