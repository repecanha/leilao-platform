"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { atualizarNoticias } from "@/app/noticias/actions";

export default function AtualizarNoticiasButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const atualizar = () => {
    startTransition(async () => {
      await atualizarNoticias();
      router.refresh();
    });
  };

  return (
    <button
      onClick={atualizar}
      disabled={pending}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition hover:bg-muted-bg disabled:opacity-60"
    >
      <RefreshCw size={14} className={pending ? "animate-spin" : ""} />
      {pending ? "Atualizando..." : "Atualizar notícias"}
    </button>
  );
}
