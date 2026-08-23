import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  FileSearch,
  Gavel,
  Handshake,
  KeyRound,
  LayoutGrid,
  ScrollText,
  TrendingUp,
} from "lucide-react";

const SERVICOS = [
  {
    icon: FileSearch,
    title: "Análise de oportunidade",
    desc: "Avalie valor de mercado, débitos e riscos jurídicos do imóvel antes do lance.",
  },
  {
    icon: Calculator,
    title: "Viabilidade financeira",
    desc: "Simule custo total, financiamento e retorno esperado com a arrematação.",
  },
  {
    icon: Gavel,
    title: "Acompanhamento do leilão",
    desc: "Organize a estratégia de lance no leilão judicial ou extrajudicial.",
  },
  {
    icon: ScrollText,
    title: "Carta de arrematação",
    desc: "Acompanhe a expedição da carta, registro e regularização do imóvel.",
  },
  {
    icon: KeyRound,
    title: "Desocupação",
    desc: "Registre o andamento do processo de imissão na posse quando aplicável.",
  },
  {
    icon: Handshake,
    title: "Do lance às chaves",
    desc: "Um só lugar para acompanhar cada etapa, da análise à entrega das chaves.",
  },
];

const PASSOS = [
  { icon: LayoutGrid, title: "Cadastre", desc: "Adicione o imóvel de interesse com o link do leilão original." },
  { icon: Calculator, title: "Analise", desc: "Use a calculadora de viabilidade para estimar o retorno." },
  { icon: Gavel, title: "Arremate", desc: "Acompanhe o imóvel pelas etapas até o lance." },
  { icon: TrendingUp, title: "Acompanhe", desc: "Veja o desempenho da sua carteira depois de arrematar." },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Seu painel pessoal de leilões de imóveis
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Cadastre os imóveis que você tem interesse em arrematar e os que já arrematou,
              acompanhe cada um pelas etapas do processo e analise a viabilidade de cada
              oportunidade — tudo em um só lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/painel?tab=meus-imoveis"
                className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                <LayoutGrid size={16} /> Ir para o painel
              </Link>
              <Link
                href="/painel?tab=calculadora"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <Calculator size={16} /> Calculadora de viabilidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Como funciona</h2>
            <p className="mt-1 text-sm text-muted">Do cadastro ao acompanhamento pós-arremate</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <div key={p.title} className="relative rounded-xl border border-border bg-card p-5">
                <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p.icon className="text-brand" size={22} />
                <h3 className="mt-3 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">O que dá para acompanhar</h2>
          <p className="mx-auto mt-1 max-w-xl text-sm text-muted">
            Cada etapa do processo de arrematação organizada num painel só.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <s.icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Pronto para organizar seus leilões?</h2>
            <p className="mt-1 text-sm text-white/70">Adicione o primeiro imóvel e comece a acompanhar.</p>
          </div>
          <Link
            href="/painel?tab=meus-imoveis"
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Ir para o painel <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
