"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, SearchX } from "lucide-react";
import FilterBar, { Filters } from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import { Imovel } from "@/lib/types";

const DEFAULT_FILTERS: Filters = { estado: "", cidade: "", tipo: "", minDesconto: 30, maxLance: "" };

export default function BuscarPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImoveis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.set("estado", filters.estado);
      if (filters.cidade) params.set("cidade", filters.cidade);
      if (filters.tipo) params.set("tipo", filters.tipo);
      if (filters.maxLance) params.set("maxLance", filters.maxLance);
      params.set("minDesconto", String(filters.minDesconto));
      params.set("limit", "24");

      const res = await fetch(`/api/imoveis?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao buscar imóveis");
      const data = await res.json();
      setImoveis(data.imoveis);
      setTotal(data.total);
    } catch {
      setError("Não foi possível carregar os imóveis agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchImoveis, 250);
    return () => clearTimeout(t);
  }, [fetchImoveis]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Buscar Imóveis de Leilão</h1>
        <p className="mt-1 text-sm text-muted">
          {loading ? "Buscando oportunidades..." : `${total} imóveis encontrados com os filtros atuais`}
        </p>
      </div>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-24 text-muted">
          <Loader2 className="animate-spin" size={20} />
          Carregando imóveis...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-10 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && imoveis.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-20 text-center text-muted">
          <SearchX size={28} />
          <p className="font-medium">Nenhum imóvel encontrado com esses filtros</p>
          <p className="text-sm">Tente reduzir o desconto mínimo ou remover algum filtro.</p>
        </div>
      )}

      {!loading && !error && imoveis.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {imoveis.map((im) => (
            <PropertyCard key={im.id} imovel={im} />
          ))}
        </div>
      )}
    </div>
  );
}
