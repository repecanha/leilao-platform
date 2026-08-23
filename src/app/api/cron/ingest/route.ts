import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { normalizar } from "@/lib/normalize";
import { getSupabaseAdmin } from "@/lib/supabase";
import { preencherCoordenadasPendentes } from "@/lib/geocode";

const ACTOR = "gio21/leilaoimovel-scraper";
const ESTADOS = ["SP", "RJ", "MG", "PR", "RS"];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = process.env.APIFY_TOKEN;
  const admin = getSupabaseAdmin();
  if (!token) return NextResponse.json({ error: "APIFY_TOKEN não configurado" }, { status: 500 });
  if (!admin) return NextResponse.json({ error: "Supabase admin não configurado" }, { status: 500 });

  const apify = new ApifyClient({ token });
  const estadosParam = req.nextUrl.searchParams.get("estados");
  const estados = estadosParam ? estadosParam.split(",") : ESTADOS;
  const maxItems = Number(req.nextUrl.searchParams.get("maxItems") || 60);

  const resultado: Record<string, number | string> = {};
  let totalUpsertado = 0;

  // Sequencial de propósito: cada run do ator consome ~4GB na conta Apify, rodar em
  // paralelo estoura o teto de memória do plano gratuito (já vimos isso acontecer).
  for (const estado of estados) {
    try {
      const run = await apify.actor(ACTOR).call({ state: estado, maxItems, minDiscount: 0 }, { timeout: 120 });
      const { items } = await apify.dataset(run.defaultDatasetId).listItems();
      const imoveis = items
        .map((i) => normalizar(i, "leilaoimovel"))
        .filter((im) => im.avaliacao > 0 && im.lance_minimo > 0);

      if (imoveis.length > 0) {
        const { error } = await admin.from("imoveis").upsert(
          imoveis.map((im) => ({ ...im, updated_at: new Date().toISOString() })),
          { onConflict: "id" }
        );
        if (error) throw error;
      }

      resultado[estado] = imoveis.length;
      totalUpsertado += imoveis.length;
    } catch (err) {
      resultado[estado] = `erro: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // Geocodifica os imóveis recém-gravados (e qualquer pendente anterior) para o
  // mapa ter pins — respeitando o limite de 1 req/s do Nominatim, então isso pode
  // demorar. Desative com ?geocode=0 se só quiser gravar os dados rapidamente.
  let geocodificacao = null;
  if (req.nextUrl.searchParams.get("geocode") !== "0" && totalUpsertado > 0) {
    try {
      geocodificacao = await preencherCoordenadasPendentes(admin, Math.min(totalUpsertado, 200));
    } catch (err) {
      geocodificacao = { erro: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json({ totalUpsertado, porEstado: resultado, geocodificacao });
}
