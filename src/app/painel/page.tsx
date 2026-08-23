import { listImoveis } from "@/lib/imoveis-service";
import PainelShell, { TabId, TABS } from "@/components/painel/PainelShell";

export const metadata = { title: "Painel do Investidor — Radar Leilões" };

const VALID_TABS = new Set(TABS.map((t) => t.id));

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { imoveis } = await listImoveis({ minDesconto: 0, limit: 200 });
  const { tab: rawTab } = await searchParams;
  const tab: TabId = rawTab && VALID_TABS.has(rawTab as TabId) ? (rawTab as TabId) : "mapa";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Painel do Investidor</h1>
        <p className="mt-1 text-sm text-muted">
          Mapa, sugestões, análises salvas, calculadora, arrematados e sua carteira — tudo em um só lugar.
        </p>
      </div>

      <PainelShell imoveis={imoveis} tab={tab} />
    </div>
  );
}
