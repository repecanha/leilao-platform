"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Gavel, X } from "lucide-react";

export default function MarcarArrematado({ id, arrematado, lanceMinimo }: { id: string; arrematado: boolean; lanceMinimo: number }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [preco, setPreco] = useState(lanceMinimo);
  const [salvando, setSalvando] = useState(false);

  const atualizar = async (patch: Record<string, unknown>) => {
    setSalvando(true);
    await fetch(`/api/imoveis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSalvando(false);
    router.refresh();
  };

  if (arrematado) {
    return (
      <button
        onClick={() => atualizar({ pipeline_etapa: "nao_iniciada", preco_arrematado: null })}
        disabled={salvando}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-success/30 bg-success-bg px-4 py-2.5 text-sm font-semibold text-success hover:opacity-80 disabled:opacity-60"
      >
        <CheckCircle2 size={16} /> Arrematado — clique para desmarcar
      </button>
    );
  }

  if (editando) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
          placeholder="Preço de arremate (R$)"
        />
        <button
          onClick={async () => {
            await atualizar({ pipeline_etapa: "arrematado", preco_arrematado: preco });
            setEditando(false);
          }}
          disabled={salvando}
          className="shrink-0 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Confirmar
        </button>
        <button
          onClick={() => setEditando(false)}
          aria-label="Cancelar"
          className="shrink-0 rounded-md p-2 text-muted hover:bg-muted-bg"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted-bg"
    >
      <Gavel size={16} /> Marcar como arrematado
    </button>
  );
}
