import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Calculator,
  ClipboardCheck,
  FileSearch,
  Gavel,
  Handshake,
  KeyRound,
  MapPinned,
  ScrollText,
  Search,
} from "lucide-react";
import { listImoveis } from "@/lib/imoveis-service";
import PropertyCard from "@/components/PropertyCard";

// Nunca deixa esta página ser pré-renderizada em build time: já vimos isso disparar
// scrapes ao vivo reais durante `next build` (Supabase pausado no momento do build),
// gastando crédito do Apify e quase estourando o timeout de geração estática do Next.
export const dynamic = "force-dynamic";

const SERVICOS = [
  {
    icon: FileSearch,
    title: "Análise de oportunidade",
    desc: "Avaliamos valor de mercado, débitos e riscos jurídicos do imóvel antes do lance.",
  },
  {
    icon: Calculator,
    title: "Viabilidade financeira",
    desc: "Simulação de custo total, financiamento e retorno esperado com a arrematação.",
  },
  {
    icon: Gavel,
    title: "Acompanhamento do leilão",
    desc: "Orientação sobre estratégia de lance no leilão judicial ou extrajudicial.",
  },
  {
    icon: ScrollText,
    title: "Carta de arrematação",
    desc: "Suporte na expedição da carta, registro e regularização do imóvel.",
  },
  {
    icon: KeyRound,
    title: "Desocupação",
    desc: "Condução do processo de imissão na posse quando o imóvel está ocupado.",
  },
  {
    icon: Handshake,
    title: "Assessoria completa",
    desc: "Do lance à entrega das chaves, com equipe própria de advogados e gestores.",
  },
];

const PASSOS = [
  { icon: Search, title: "Busque", desc: "Filtre imóveis de leilão por cidade, tipo e desconto." },
  { icon: Calculator, title: "Analise", desc: "Use a calculadora de viabilidade para estimar retorno." },
  { icon: Gavel, title: "Arremate", desc: "Dê o lance com segurança, com ou sem nossa assessoria." },
  { icon: ClipboardCheck, title: "Regularize", desc: "Cuidamos da carta, registro e, se preciso, desocupação." },
];

export default async function HomePage() {
  const { imoveis } = await listImoveis({ minDesconto: 40, limit: 4 });

  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <BadgePercent size={14} /> Imóveis com até 70% de desconto
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Encontre as melhores oportunidades em leilões de imóveis
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Agregamos leilões da Caixa, Santander, Itaú, Bradesco e leiloeiros parceiros em
              todo o Brasil — com análise de viabilidade e assessoria completa da lance à escritura.
            </p>

            <form action="/buscar" className="mt-8 flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row">
              <input
                name="cidade"
                placeholder="Cidade, bairro ou estado"
                className="flex-1 rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                <Search size={16} /> Buscar Imóveis
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
              <span>500+ leiloeiros parceiros</span>
              <span>Judicial e extrajudicial</span>
              <span>Todo o Brasil</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Oportunidades em destaque</h2>
            <p className="mt-1 text-sm text-muted">Imóveis com maior desconto sobre a avaliação agora</p>
          </div>
          <Link href="/buscar" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:flex">
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {imoveis.map((im) => (
            <PropertyCard key={im.id} imovel={im} />
          ))}
        </div>

        <Link
          href="/buscar"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-brand hover:underline sm:hidden"
        >
          Ver todos <ArrowRight size={15} />
        </Link>
      </section>

      <section className="bg-muted-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Como funciona</h2>
            <p className="mt-1 text-sm text-muted">Do primeiro filtro até as chaves na mão</p>
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
          <h2 className="text-2xl font-bold text-foreground">Assessoria completa, se você preferir não ir sozinho</h2>
          <p className="mx-auto mt-1 max-w-xl text-sm text-muted">
            Nossa equipe cuida de cada etapa do processo de arrematação, da análise jurídica à desocupação.
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
            <h2 className="text-2xl font-bold text-white">Pronto para encontrar sua próxima oportunidade?</h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70 lg:justify-start">
              <MapPinned size={15} /> Busque agora entre milhares de imóveis de leilão em todo o Brasil.
            </p>
          </div>
          <Link
            href="/buscar"
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Buscar Imóveis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
