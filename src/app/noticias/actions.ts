"use server";

import { revalidateTag } from "next/cache";
import { TAG_NOTICIAS } from "@/lib/noticias";

export async function atualizarNoticias() {
  // expire: 0 força um cache-miss bloqueante na próxima leitura — o usuário
  // que clicou em "Atualizar" vê dados novos na hora, em vez do
  // stale-while-revalidate padrão (profile "max"), que só atualizaria em
  // segundo plano na próxima visita.
  revalidateTag(TAG_NOTICIAS, { expire: 0 });
}
