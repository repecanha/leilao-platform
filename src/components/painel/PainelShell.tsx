import Link from "next/link";
import { BookOpen, Briefcase, Calculator, Handshake, Landmark, LayoutGrid } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import KanbanBoard from "./KanbanBoard";
import CalculadoraTab from "./CalculadoraTab";
import FinanciamentoTab from "./FinanciamentoTab";
import CarteiraTab from "./CarteiraTab";
import LivroCaixaTab from "./LivroCaixaTab";
import ServicosTab from "./ServicosTab";

export const TABS = [
  { id: "meus-imoveis", label: "Meus Imóveis", icon: LayoutGrid },
  { id: "calculadora", label: "Calculadora", icon: Calculator },
  { id: "financiamento", label: "Financiamento", icon: Landmark },
  { id: "carteira", label: "Carteira", icon: Briefcase },
  { id: "livro-caixa", label: "Livro Caixa", icon: BookOpen },
  { id: "servicos", label: "Serviços", icon: Handshake },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export default function PainelShell({ tab }: { tab: TabId }) {
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
        {tab === "meus-imoveis" && <KanbanBoard />}
        {tab === "calculadora" && <CalculadoraTab />}
        {tab === "financiamento" && <FinanciamentoTab />}
        {tab === "carteira" && <CarteiraTab />}
        {tab === "livro-caixa" && <LivroCaixaTab />}
        {tab === "servicos" && <ServicosTab />}
      </ErrorBoundary>
    </div>
  );
}
