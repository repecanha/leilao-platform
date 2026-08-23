"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ViabilidadeConfig } from "./types";

export type Favorito = { id: string; addedAt: string };
export type Arrematado = { id: string; precoArrematado: number; data: string };

export const ETAPAS_PIPELINE = [
  "nao_iniciada",
  "financeiro",
  "mercadologico",
  "juridico",
  "aprovado",
  "cadastro",
  "arrematado",
  "nao_arrematado",
  "reprovado",
] as const;
export type EtapaPipeline = (typeof ETAPAS_PIPELINE)[number];
export const ETAPA_LABEL: Record<EtapaPipeline, string> = {
  nao_iniciada: "Não iniciada",
  financeiro: "Financeiro",
  mercadologico: "Mercadológico",
  juridico: "Jurídico",
  aprovado: "Aprovado",
  cadastro: "Cadastro",
  arrematado: "Arrematado",
  nao_arrematado: "Não arrematado",
  reprovado: "Reprovado",
};
export type PipelineItem = { imovelId: string; etapa: EtapaPipeline; updatedAt: string };
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

const KEYS = {
  favoritos: "radarleiloes:favoritos",
  arrematados: "radarleiloes:arrematados",
  analises: "radarleiloes:analises",
  pipeline: "radarleiloes:pipeline",
} as const;

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

function useStoredList<T extends { id?: string; uid?: string }>(key: string) {
  const items = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => getSnapshot<T>(key),
    getServerSnapshot
  );

  const set = useCallback(
    (next: T[]) => {
      write(key, next);
    },
    [key]
  );

  return { items, set };
}

export function useFavoritos() {
  const { items, set } = useStoredList<Favorito>(KEYS.favoritos);

  const isFavorito = useCallback((id: string) => items.some((f) => f.id === id), [items]);

  const toggle = useCallback(
    (id: string) => {
      if (items.some((f) => f.id === id)) {
        set(items.filter((f) => f.id !== id));
      } else {
        set([...items, { id, addedAt: new Date().toISOString() }]);
      }
    },
    [items, set]
  );

  return { favoritos: items, isFavorito, toggle };
}

export function useArrematados() {
  const { items, set } = useStoredList<Arrematado>(KEYS.arrematados);

  const isArrematado = useCallback((id: string) => items.some((a) => a.id === id), [items]);

  const marcar = useCallback(
    (id: string, precoArrematado: number) => {
      const next = items.filter((a) => a.id !== id);
      set([...next, { id, precoArrematado, data: new Date().toISOString() }]);
    },
    [items, set]
  );

  const desmarcar = useCallback((id: string) => set(items.filter((a) => a.id !== id)), [items, set]);

  return { arrematados: items, isArrematado, marcar, desmarcar };
}

export function useAnalises() {
  const { items, set } = useStoredList<Analise>(KEYS.analises);

  const salvar = useCallback(
    (analise: Omit<Analise, "uid" | "data">) => {
      const registro: Analise = {
        ...analise,
        uid: `${analise.imovelId}-${Date.now()}`,
        data: new Date().toISOString(),
      };
      set([registro, ...items].slice(0, 50));
    },
    [items, set]
  );

  const remover = useCallback((uid: string) => set(items.filter((a) => a.uid !== uid)), [items, set]);

  const limpar = useCallback(() => set([]), [set]);

  return { analises: items, salvar, remover, limpar };
}

function useStoredListPlain<T>(key: string) {
  const items = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => getSnapshot<T>(key),
    getServerSnapshot
  );
  const set = useCallback((next: T[]) => write(key, next), [key]);
  return { items, set };
}

export function usePipeline() {
  const { items, set } = useStoredListPlain<PipelineItem>(KEYS.pipeline);

  const etapaDe = useCallback((imovelId: string) => items.find((p) => p.imovelId === imovelId)?.etapa, [items]);

  const adicionar = useCallback(
    (imovelId: string, etapa: EtapaPipeline = "nao_iniciada") => {
      if (items.some((p) => p.imovelId === imovelId)) return;
      set([...items, { imovelId, etapa, updatedAt: new Date().toISOString() }]);
    },
    [items, set]
  );

  const mover = useCallback(
    (imovelId: string, etapa: EtapaPipeline) => {
      const next = items.map((p) => (p.imovelId === imovelId ? { ...p, etapa, updatedAt: new Date().toISOString() } : p));
      set(next);
    },
    [items, set]
  );

  const remover = useCallback((imovelId: string) => set(items.filter((p) => p.imovelId !== imovelId)), [items, set]);

  return { pipeline: items, etapaDe, adicionar, mover, remover };
}
