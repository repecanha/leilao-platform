import Link from "next/link";
import { ArrowRight, Calculator, ClipboardCheck, Gavel, LayoutGrid } from "lucide-react";

export const metadata = { title: "Como Funciona — Radar Leilões" };

const ETAPAS = [
  {
    icon: LayoutGrid,
    title: "1. Cadastre o imóvel",
    desc: "Adicione o imóvel que te interessa com o link do leilão original (Caixa, leiloeiro, portal — onde você o encontrou) e os principais dados: avaliação, lance mínimo, tipo e data.",
  },
  {
    icon: Calculator,
    title: "2. Analise a viabilidade",
    desc: "Na ficha do imóvel, informe aluguel esperado, custo de reforma e pendências, e veja score de viabilidade, yield, ROI e payback estimados antes de decidir.",
  },
  {
    icon: Gavel,
    title: "3. Acompanhe pelo pipeline",
    desc: "Mova o imóvel pelas etapas (financeiro, jurídico, aprovado...) até o lance, arrastando o card no painel Kanban.",
  },
  {
    icon: ClipboardCheck,
    title: "4. Marque como arrematado",
    desc: "Depois de arrematar, registre o preço final — o imóvel passa a contar na sua Carteira, com projeção de patrimônio.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Como funciona</h1>
      <p className="mt-4 text-muted">
        O Radar Leilões é o seu painel pessoal para acompanhar imóveis de leilão que você
        encontra em outras ferramentas — do interesse inicial até a arrematação.
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
        href="/painel?tab=meus-imoveis"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Ir para o painel <ArrowRight size={16} />
      </Link>
    </div>
  );
}
