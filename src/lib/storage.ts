"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ViabilidadeConfig } from "./types";

// Histórico local de simulações da calculadora ("Biblioteca de análises"). Isso
// continua no navegador (não no Supabase) porque é só um bloco de notas pessoal
// de simulações — o estado real dos imóveis (pipeline, arrematado, preço) mora no
// banco desde a virada para cadastro manual.
export type Analise = {
  uid: string;
  imovelId: string;
  endereco: string;
  cidade: string;
  estado: string;
  data: string;
  score: number;
  yl: number;
  roi: number;
  fc: number;
  total: number;
  cfg: ViabilidadeConfig;
};

const KEY_ANALISES = "radarleiloes:analises";

const snapshotCache = new Map<string, { raw: string | null; value: unknown[] }>();

function getSnapshot<T>(key: string): T[] {
  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T[];
  let value: T[] = [];
  try {
    value = raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    value = [];
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

const EMPTY: never[] = [];
function getServerSnapshot() {
  return EMPTY;
}

function subscribe(key: string, callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === key) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

export function useAnalises() {
  const items = useSyncExternalStore(
    (callback) => subscribe(KEY_ANALISES, callback),
    () => getSnapshot<Analise>(KEY_ANALISES),
    getServerSnapshot
  );

  const salvar = useCallback(
    (analise: Omit<Analise, "uid" | "data">) => {
      const registro: Analise = {
        ...analise,
        uid: `${analise.imovelId}-${Date.now()}`,
        data: new Date().toISOString(),
      };
      write(KEY_ANALISES, [registro, ...items].slice(0, 50));
    },
    [items]
  );

  const remover = useCallback((uid: string) => write(KEY_ANALISES, items.filter((a) => a.uid !== uid)), [items]);

  const limpar = useCallback(() => write(KEY_ANALISES, []), []);

  return { analises: items, salvar, remover, limpar };
}
