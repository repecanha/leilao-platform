import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, Car, ExternalLink, MapPin, Ruler, Scale, ShieldAlert } from "lucide-react";
import { getImovel } from "@/lib/imoveis-service";
import { fmt, fmtData } from "@/lib/format";
import ViabilityCalculator from "@/components/ViabilityCalculator";
import MarcarArrematado from "@/components/MarcarArrematado";
import EnviarParaAnalise from "@/components/EnviarParaAnalise";
import PropertyPhoto from "@/components/PropertyPhoto";

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imovel = await getImovel(id);
  if (!imovel) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/buscar" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={15} /> Voltar para a busca
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-brand-light text-brand/40 sm:h-80">
            <PropertyPhoto foto={imovel.foto} alt={imovel.endereco} tipo={imovel.tipo} />
            <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-sm font-bold text-white">
              {imovel.desconto}% de desconto
            </span>
          </div>

          <div className="mt-5 flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} />
            <span>
              {imovel.bairro ? `${imovel.bairro}, ` : ""}
              {imovel.cidade}/{imovel.estado}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{imovel.endereco}</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            {imovel.area > 0 && (
              <span className="flex items-center gap-1.5">
                <Ruler size={15} /> {imovel.area} m²
              </span>
            )}
            {imovel.quartos > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble size={15} /> {imovel.quartos} quartos
              </span>
            )}
            {imovel.vaga && (
              <span className="flex items-center gap-1.5">
                <Car size={15} /> Com vaga
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Scale size={15} /> {imovel.modalidade}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Avaliação</p>
              <p className="font-semibold text-foreground line-through decoration-muted/50">{fmt(imovel.avaliacao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Lance mínimo</p>
              <p className="text-lg font-bold text-brand">{fmt(imovel.lance_minimo)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Data do leilão</p>
              <p className="font-semibold text-foreground">{fmtData(imovel.data_leilao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Leiloeiro</p>
              <p className="font-semibold text-foreground">{imovel.leiloeiro}</p>
            </div>
          </div>

          {imovel.pendencias.length > 0 && (
            <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent-dark">
                <ShieldAlert size={16} /> Pendências identificadas
              </div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/80">
                {imovel.pendencias.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted">
            <p>
              <span className="font-medium text-foreground">Matrícula:</span> {imovel.matricula || "Não informada"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">Ocupação:</span>{" "}
              {imovel.ocupado ? "Imóvel ocupado" : "Imóvel desocupado"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">Fonte:</span> {imovel.fonte}
            </p>
          </div>

          {imovel.link && imovel.link !== "#" && (
            <a
              href={imovel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Ver edital oficial <ExternalLink size={15} />
            </a>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ViabilityCalculator imovel={imovel} />
          <EnviarParaAnalise id={imovel.id} />
          <MarcarArrematado id={imovel.id} lanceMinimo={imovel.lance_minimo} />
        </div>
      </div>
    </div>
  );
}
