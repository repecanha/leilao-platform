import Link from "next/link";
import { ArrowRight, Calculator, ClipboardCheck, Gavel, Search } from "lucide-react";

export const metadata = { title: "Como Funciona — Radar Leilões" };

const ETAPAS = [
  {
    icon: Search,
    title: "1. Busque e filtre",
    desc: "Use os filtros de estado, cidade, tipo de imóvel e desconto mínimo para encontrar oportunidades que fazem sentido pra você. Os dados vêm de leiloeiros como Caixa, Santander e parceiros regionais.",
  },
  {
    icon: Calculator,
    title: "2. Analise a viabilidade",
    desc: "Cada imóvel tem uma calculadora própria: informe aluguel esperado, custo de reforma e pendências, e veja score de viabilidade, yield, ROI e payback estimados antes de decidir.",
  },
  {
    icon: Gavel,
    title: "3. Dê o lance",
    desc: "Acompanhe a data e a modalidade do leilão (judicial ou extrajudicial) e acesse o edital oficial do leiloeiro para participar do pregão com segurança.",
  },
  {
    icon: ClipboardCheck,
    title: "4. Regularize o imóvel",
    desc: "Depois de arrematar, cuidamos — se você quiser — da carta de arrematação, registro em cartório, baixa de gravames e, quando necessário, do processo de desocupação.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Como funciona</h1>
      <p className="mt-4 text-muted">
        A Radar Leilões agrega oportunidades de imóveis em leilão de várias fontes e te dá as
        ferramentas para decidir com dados, não com achismo.
      </p>

      <div className="mt-10 space-y-6">
        {ETAPAS.map((e) => (
          <div key={e.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
              <e.icon size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{e.title}</h3>
              <p className="mt-1 text-sm text-muted">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/buscar"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Começar a buscar <ArrowRight size={16} />
      </Link>
    </div>
  );
}
