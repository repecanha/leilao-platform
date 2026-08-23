import { Award, Target, Users } from "lucide-react";

export const metadata = { title: "Sobre — Radar Leilões" };

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Sobre a Radar Leilões</h1>
      <p className="mt-4 text-muted">
        Nascemos para resolver um problema simples: leilões de imóveis no Brasil estão
        espalhados em centenas de sites de leiloeiros diferentes, com editais difíceis de
        comparar. Reunimos essas oportunidades em um só lugar e damos as ferramentas para
        analisar se cada uma delas realmente vale o lance.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <Target className="text-brand" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Missão</h3>
          <p className="mt-1 text-sm text-muted">
            Dar transparência e dados a quem quer investir em imóveis de leilão, do primeiro
            filtro à escritura.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Users className="text-brand" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Para quem</h3>
          <p className="mt-1 text-sm text-muted">
            Investidores iniciantes e experientes, famílias buscando o primeiro imóvel com
            desconto, e profissionais do setor imobiliário.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Award className="text-brand" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Como trabalhamos</h3>
          <p className="mt-1 text-sm text-muted">
            Dados atualizados direto das fontes oficiais, cálculo de viabilidade transparente e,
            se você preferir, assessoria completa do lance às chaves.
          </p>
        </div>
      </div>
    </div>
  );
}
