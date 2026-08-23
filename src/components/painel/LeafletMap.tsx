"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import { Imovel } from "@/lib/types";
import { fmt, fmtShort } from "@/lib/format";

function corPorDesconto(desconto: number) {
  if (desconto >= 45) return "#12805c";
  if (desconto >= 30) return "#c9982f";
  return "#0e3a5f";
}

function priceIcon(imovel: Imovel) {
  const cor = corPorDesconto(imovel.desconto);
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${cor};
      color:#fff;
      font-size:11px;
      font-weight:700;
      padding:3px 8px;
      border-radius:999px;
      white-space:nowrap;
      box-shadow:0 1px 4px rgba(0,0,0,.35);
      border:2px solid #fff;
      transform:translate(-50%,-100%);
    ">${fmtShort(imovel.lance_minimo)}</div>`,
    iconSize: [0, 0],
  });
}

export default function LeafletMap({ imoveis }: { imoveis: Imovel[] }) {
  const comCoordenadas = imoveis.filter((im) => im.lat && im.lng);
  const center: [number, number] =
    comCoordenadas.length > 0 ? [comCoordenadas[0].lat!, comCoordenadas[0].lng!] : [-23.5505, -46.6333];

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {comCoordenadas.map((im) => (
        <Marker key={im.id} position={[im.lat!, im.lng!]} icon={priceIcon(im)}>
          <Popup>
            <div className="min-w-[180px] text-sm">
              <p className="font-semibold">{im.endereco}</p>
              <p className="text-xs text-gray-500">
                {im.cidade}/{im.estado}
              </p>
              <p className="mt-1">
                <span className="line-through text-gray-400">{fmt(im.avaliacao)}</span>{" "}
                <span className="font-bold text-[#0e3a5f]">{fmt(im.lance_minimo)}</span>
              </p>
              <Link href={`/imovel/${im.id}`} className="mt-1 inline-block font-semibold text-[#0e3a5f] underline">
                Ver detalhes
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
