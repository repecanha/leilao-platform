import Link from "next/link";
import {
  Briefcase,
  Calculator,
  CircleDollarSign,
  Gavel,
  Handshake,
  Map as MapIcon,
  NotebookText,
  Sparkles,
} from "lucide-react";
import { Imovel } from "@/lib/types";
import ErrorBoundary from "@/components/ErrorBoundary";
import MapaTab from "./MapaTab";
import SugeridosTab from "./SugeridosTab";
import KanbanBoard from "./KanbanBoard";
import CalculadoraTab from "./CalculadoraTab";
import CreditosTab from "./CreditosTab";
import ArrematadosTab from "./ArrematadosTab";
import CarteiraTab from "./CarteiraTab";
import ServicosTab from "./ServicosTab";

export const TABS = [
  { id: "mapa", label: "Mapa", icon: MapIcon },
  { id: "sugeridos", label: "Sugeridos", icon: Sparkles },
  { id: "analises", label: "Análises", icon: NotebookText },
  { id: "calculadora", label: "Calculadora", icon: Calculator },
  { id: "creditos", label: "Créditos", icon: CircleDollarSign },
  { id: "arrematados", label: "Arrematados", icon: Gavel },
  { id: "carteira", label: "Carteira", icon: Briefcase },
  { id: "servicos", label: "Serviços", icon: Handshake },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export default function PainelShell({ imoveis, tab }: { imoveis: Imovel[]; tab: TabId }) {
  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5 print:hidden">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/painel?tab=${t.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active ? "bg-brand text-white" : "text-foreground/70 hover:bg-muted-bg"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </Link>
          );
        })}
      </div>

      <ErrorBoundary label={tab}>
        {tab === "mapa" && <MapaTab imoveis={imoveis} />}
        {tab === "sugeridos" && <SugeridosTab imoveis={imoveis} />}
        {tab === "analises" && <KanbanBoard imoveis={imoveis} />}
        {tab === "calculadora" && <CalculadoraTab />}
        {tab === "creditos" && <CreditosTab />}
        {tab === "arrematados" && <ArrematadosTab imoveis={imoveis} />}
        {tab === "carteira" && <CarteiraTab imoveis={imoveis} />}
        {tab === "servicos" && <ServicosTab />}
      </ErrorBoundary>
    </div>
  );
}
