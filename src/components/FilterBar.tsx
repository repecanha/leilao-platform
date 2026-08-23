"use client";

import { SlidersHorizontal } from "lucide-react";

export type Filters = {
  estado: string;
  cidade: string;
  tipo: string;
  minDesconto: number;
  maxLance: string;
};

const ESTADOS = ["SP", "RJ", "MG", "PR", "RS"];
const TIPOS = ["Apartamento", "Casa", "Terreno", "Sala Comercial", "Galpão", "Kitnet"];

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal size={16} className="text-brand" />
        Filtros
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Estado</label>
          <select
            value={filters.estado}
            onChange={(e) => set("estado", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Cidade</label>
          <input
            value={filters.cidade}
            onChange={(e) => set("cidade", e.target.value)}
            placeholder="Ex: Campinas"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Tipo</label>
          <select
            value={filters.tipo}
            onChange={(e) => set("tipo", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Desconto mín. <span className="text-brand">{filters.minDesconto}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={filters.minDesconto}
            onChange={(e) => set("minDesconto", Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-muted">Lance máx. (R$)</label>
          <input
            type="number"
            value={filters.maxLance}
            onChange={(e) => set("maxLance", e.target.value)}
            placeholder="Sem limite"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() =>
              onChange({ estado: "", cidade: "", tipo: "", minDesconto: 30, maxLance: "" })
            }
            className="w-full rounded-lg border border-border px-2.5 py-2 text-sm font-medium text-muted hover:bg-muted-bg"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
