"use client";

import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { ETAPA_LABEL, usePipeline } from "@/lib/storage";

export default function EnviarParaAnalise({ id }: { id: string }) {
  const { etapaDe, adicionar } = usePipeline();
  const etapa = etapaDe(id);

  if (etapa) {
    return (
      <div className="mt-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand-light px-4 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-medium text-brand">
          <CheckCircle2 size={16} /> No pipeline: {ETAPA_LABEL[etapa]}
        </span>
        <Link href="/painel?tab=analises" className="text-xs font-semibold text-brand hover:underline">
          Ver pipeline
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={() => adicionar(id)}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted-bg"
    >
      <Send size={15} /> Enviar para análise
    </button>
  );
}
