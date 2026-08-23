"use client";

import Link from "next/link";
import { BedDouble, Car, Heart, MapPin, Ruler, Scale } from "lucide-react";
import { Imovel } from "@/lib/types";
import { fmt, fmtData } from "@/lib/format";
import { useFavoritos } from "@/lib/storage";
import PropertyPhoto from "@/components/PropertyPhoto";

export default function PropertyCard({ imovel }: { imovel: Imovel }) {
  const { isFavorito, toggle } = useFavoritos();
  const favorito = isFavorito(imovel.id);

  return (
    <Link
      href={`/imovel/${imovel.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-brand-light text-brand/40">
        <PropertyPhoto foto={imovel.foto} alt={imovel.endereco} tipo={imovel.tipo} />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
          {imovel.desconto}% OFF
        </span>
        {imovel.status === "Urgente" && (
          <span className="absolute right-3 top-3 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
            Urgente
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(imovel.id);
          }}
          aria-label={favorito ? "Remover da carteira" : "Adicionar à carteira"}
          aria-pressed={favorito}
          className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow transition ${
            favorito ? "bg-danger text-white" : "bg-white/90 text-foreground/60 hover:text-danger"
          }`}
        >
          <Heart size={15} fill={favorito ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-1 text-xs text-muted">
          <MapPin size={13} />
          <span>
            {imovel.bairro ? `${imovel.bairro}, ` : ""}
            {imovel.cidade}/{imovel.estado}
          </span>
        </div>

        <p className="line-clamp-2 text-sm font-medium text-foreground">{imovel.endereco}</p>

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {imovel.area > 0 && (
            <span className="flex items-center gap-1">
              <Ruler size={13} /> {imovel.area}m²
            </span>
          )}
          {imovel.quartos > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={13} /> {imovel.quartos}
            </span>
          )}
          {imovel.vaga && (
            <span className="flex items-center gap-1">
              <Car size={13} /> Vaga
            </span>
          )}
          <span className="flex items-center gap-1">
            <Scale size={13} /> {imovel.modalidade}
          </span>
        </div>

        <div className="mt-auto space-y-1 border-t border-border pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted line-through">{fmt(imovel.avaliacao)}</span>
            <span className="text-xs text-muted">{imovel.leiloeiro}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-brand">{fmt(imovel.lance_minimo)}</span>
          </div>
          <p className="text-xs text-muted">Leilão em {fmtData(imovel.data_leilao)}</p>
        </div>
      </div>
    </Link>
  );
}
