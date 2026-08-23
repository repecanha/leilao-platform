"use client";

import { useState } from "react";
import { CheckCircle2, Gavel, X } from "lucide-react";
import { useArrematados } from "@/lib/storage";

export default function MarcarArrematado({ id, lanceMinimo }: { id: string; lanceMinimo: number }) {
  const { isArrematado, marcar, desmarcar } = useArrematados();
  const [editando, setEditando] = useState(false);
  const [preco, setPreco] = useState(lanceMinimo);
  const arrematado = isArrematado(id);

  if (arrematado) {
    return (
      <button
        onClick={() => desmarcar(id)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-success/30 bg-success-bg px-4 py-2.5 text-sm font-semibold text-success hover:opacity-80"
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
          onClick={() => {
            marcar(id, preco);
            setEditando(false);
          }}
          className="shrink-0 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
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
