"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ETAPAS_PIPELINE, ETAPA_LABEL, EtapaPipeline } from "@/lib/types";

export default function GerenciarImovel({ id, etapa }: { id: string; etapa: EtapaPipeline }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  const mudarEtapa = async (novaEtapa: EtapaPipeline) => {
    await fetch(`/api/imoveis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_etapa: novaEtapa }),
    });
    router.refresh();
  };

  const excluir = async () => {
    if (!confirm("Excluir este imóvel do painel? Essa ação não pode ser desfeita.")) return;
    setExcluindo(true);
    await fetch(`/api/imoveis/${id}`, { method: "DELETE" });
    router.push("/painel?tab=meus-imoveis");
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={etapa}
        onChange={(e) => mudarEtapa(e.target.value as EtapaPipeline)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
      >
        {ETAPAS_PIPELINE.map((e) => (
          <option key={e} value={e}>
            {ETAPA_LABEL[e]}
          </option>
        ))}
      </select>
      <button
        onClick={excluir}
        disabled={excluindo}
        aria-label="Excluir imóvel"
        className="shrink-0 rounded-lg border border-border p-2.5 text-muted hover:border-danger hover:text-danger disabled:opacity-60"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
