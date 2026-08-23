import { Calculator, ClipboardCheck, FileSearch, Gavel, Handshake, KeyRound, ScrollText } from "lucide-react";

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
    icon: ClipboardCheck,
    title: "Regularização documental",
    desc: "Baixa de gravames, quitação de débitos e transferência de matrícula.",
  },
];

export default function ServicosTab() {
  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Handshake size={16} className="text-brand" />
          Assessoria completa, se você preferir não ir sozinho
        </div>
        <p className="mt-1 text-sm text-muted">
          Da análise jurídica à entrega das chaves. Estes serviços são informativos nesta
          versão — fale conosco para detalhes de disponibilidade e valores.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
