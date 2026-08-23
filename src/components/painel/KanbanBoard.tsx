"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, X } from "lucide-react";
import { Imovel } from "@/lib/types";
import { fmt } from "@/lib/format";
import { ETAPAS_PIPELINE, ETAPA_LABEL, EtapaPipeline, usePipeline } from "@/lib/storage";

export default function KanbanBoard({ imoveis }: { imoveis: Imovel[] }) {
  const { pipeline, mover, remover } = usePipeline();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [dragId, setDragId] = useState<string | null>(null);

  const registros = pipeline
    .map((p) => ({ p, im: imoveis.find((i) => i.id === p.imovelId) }))
    .filter((r): r is { p: (typeof pipeline)[number]; im: Imovel } => !!r.im);

  const handleDrop = (etapa: EtapaPipeline) => {
    if (dragId) mover(dragId, etapa);
    setDragId(null);
  };

  if (registros.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
        <LayoutGrid size={28} />
        <p className="font-medium">Nenhum imóvel em análise</p>
        <p className="text-sm">
          Na ficha de um imóvel, use “Enviar para análise” para começar a acompanhar aqui.
        </p>
        <Link href="/buscar" className="mt-2 text-sm font-semibold text-brand hover:underline">
          Buscar imóveis
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pipeline de Análises</h2>
          <p className="text-sm text-muted">{registros.length} imóveis · arraste os cards entre as etapas</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "kanban" ? "bg-brand text-white" : "text-muted hover:bg-muted-bg"
            }`}
          >
            <LayoutGrid size={13} /> Kanban
          </button>
          <button
            onClick={() => setView("lista")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "lista" ? "bg-brand text-white" : "text-muted hover:bg-muted-bg"
            }`}
          >
            <List size={13} /> Lista
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS_PIPELINE.map((etapa) => {
            const cards = registros.filter((r) => r.p.etapa === etapa);
            return (
              <div
                key={etapa}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(etapa)}
                className="w-64 shrink-0 rounded-xl border border-border bg-muted-bg p-2.5"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-foreground">{ETAPA_LABEL[etapa]}</h3>
                  <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {cards.length}
                  </span>
                </div>

                <div className="min-h-[80px] space-y-2">
                  {cards.length === 0 && (
                    <p className="px-1 py-4 text-center text-[11px] text-muted">Nenhum imóvel nesta etapa</p>
                  )}
                  {cards.map(({ p, im }) => (
                    <div
                      key={p.imovelId}
                      draggable
                      onDragStart={() => setDragId(p.imovelId)}
                      className="group cursor-grab rounded-lg border border-border bg-card p-2.5 text-xs shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Link href={`/imovel/${im.id}`} className="font-semibold text-foreground hover:text-brand">
                          {im.endereco}
                        </Link>
                        <button
                          onClick={() => remover(im.id)}
                          className="shrink-0 text-muted opacity-0 hover:text-danger group-hover:opacity-100"
                          aria-label="Remover do pipeline"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="mt-0.5 text-muted">
                        {im.cidade}/{im.estado}
                      </p>
                      <p className="mt-1 font-semibold text-brand">{fmt(im.lance_minimo)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Imóvel</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Lance mínimo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registros.map(({ p, im }) => (
                <tr key={p.imovelId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/imovel/${im.id}`} className="font-medium text-foreground hover:text-brand">
                      {im.endereco}
                    </Link>
                    <p className="text-xs text-muted">
                      {im.cidade}/{im.estado}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.etapa}
                      onChange={(e) => mover(im.id, e.target.value as EtapaPipeline)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    >
                      {ETAPAS_PIPELINE.map((etapa) => (
                        <option key={etapa} value={etapa}>
                          {ETAPA_LABEL[etapa]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand">{fmt(im.lance_minimo)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remover(im.id)} className="text-muted hover:text-danger" aria-label="Remover">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
