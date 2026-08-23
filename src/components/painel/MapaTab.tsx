"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Imovel } from "@/lib/types";
import { fmt } from "@/lib/format";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">Carregando mapa...</div>
  ),
});

export default function MapaTab({ imoveis }: { imoveis: Imovel[] }) {
  const porEstado = imoveis.reduce<Record<string, number>>((acc, im) => {
    acc[im.estado] = (acc[im.estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(porEstado).map(([estado, count]) => (
          <span
            key={estado}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <MapPin size={12} className="text-brand" />
            {estado} · {count} {count === 1 ? "imóvel" : "imóveis"}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="order-2 max-h-[560px] space-y-2 overflow-y-auto lg:order-1 lg:col-span-2">
          {imoveis.map((im) => (
            <Link
              key={im.id}
              href={`/imovel/${im.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm hover:border-brand"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{im.endereco}</p>
                <p className="text-xs text-muted">
                  {im.cidade}/{im.estado} · {im.tipo}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-brand">{fmt(im.lance_minimo)}</p>
                <p className="text-xs text-success">{im.desconto}% off</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="order-1 h-[360px] overflow-hidden rounded-xl border border-border lg:order-2 lg:col-span-3 lg:h-[560px]">
          <LeafletMap imoveis={imoveis} />
        </div>
      </div>
    </div>
  );
}
