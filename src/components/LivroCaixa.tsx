"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { fmt, fmtN, fmtData } from "@/lib/format";
import { CATEGORIAS_LANCAMENTO, CATEGORIA_LABEL, CATEGORIAS_RECEITA, CategoriaLancamento, Lancamento } from "@/lib/types";
import { ResumoLivroCaixa } from "@/lib/livroCaixa";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";

type Resposta = {
  lancamentos: Lancamento[];
  resumo: ResumoLivroCaixa;
  cdiAcumulado: number | null;
};

export default function LivroCaixa({ imovelId }: { imovelId: string }) {
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState<CategoriaLancamento>("reforma");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const carregar = async () => {
    const res = await fetch(`/api/imoveis/${imovelId}/livro-caixa`);
    const json = await res.json();
    setResposta(json);
    setCarregando(false);
  };

  useEffect(() => {
    fetch(`/api/imoveis/${imovelId}/livro-caixa`)
      .then((r) => r.json())
      .then((json) => {
        setResposta(json);
        setCarregando(false);
      });
  }, [imovelId]);

  const adicionar = async () => {
    setErro(null);
    const valorNumero = Number(valor.replace(",", "."));
    if (!valorNumero || valorNumero <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }
    const sinal = CATEGORIAS_RECEITA.includes(categoria) ? 1 : -1;

    setSalvando(true);
    try {
      const res = await fetch(`/api/imoveis/${imovelId}/lancamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, categoria, descricao, valor: valorNumero * sinal }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDescricao("");
      setValor("");
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o lançamento.");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    await fetch(`/api/lancamentos/${id}`, { method: "DELETE" });
    await carregar();
  };

  if (carregando) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-12 text-muted">
        <Loader2 className="animate-spin" size={18} /> Carregando livro caixa...
      </div>
    );
  }

  if (!resposta) return null;
  const { lancamentos, resumo, cdiAcumulado } = resposta;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <BookOpen size={18} className="text-brand" /> Livro Caixa
      </div>
      <p className="mb-4 text-sm text-muted">
        Registre cada despesa e receita da arrematação até a venda e acompanhe a evolução do seu resultado.
      </p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Desembolso total</dt>
          <dd className="text-lg font-semibold text-foreground">{fmt(resumo.desembolsoTotal)}</dd>
          <dd className="text-[11px] text-muted">Lance/arrematação + despesas</dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Receitas</dt>
          <dd className="text-lg font-semibold text-foreground">{fmt(resumo.totalReceitas)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">Lucro</dt>
          <dd className={`text-lg font-semibold ${resumo.lucro >= 0 ? "text-success" : "text-danger"}`}>
            {fmt(resumo.lucro)}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted">ROI sobre desembolso</dt>
          <dd className={`text-lg font-semibold ${resumo.roi >= 0 ? "text-success" : "text-danger"}`}>
            {fmtN(resumo.roi)}%
          </dd>
        </div>
      </dl>

      {resumo.dataInicio && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <TrendingUp size={16} className="shrink-0 text-brand" />
          <span className="text-muted">
            Rendimento no período ({resumo.diasPeriodo} dias): <b className="text-foreground">{fmtN(resumo.roi)}%</b>{" "}
            · anualizado <b className="text-foreground">{fmtN(resumo.rendimentoAnualizado)}%</b>
          </span>
          {cdiAcumulado != null && (
            <span className="ml-auto rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
              CDI no período: {fmtN(cdiAcumulado)}%
            </span>
          )}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Novo lançamento</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <div>
            <label className={LABEL_CLS}>Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaLancamento)} className={INPUT_CLS}>
              {CATEGORIAS_LANCAMENTO.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLS}>Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Opcional"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className={INPUT_CLS}
            />
          </div>
        </div>
        {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
        <button
          onClick={adicionar}
          disabled={salvando}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar lançamento
        </button>
      </div>

      {lancamentos.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Categoria</th>
                <th className="px-4 py-2.5 font-medium">Descrição</th>
                <th className="px-4 py-2.5 font-medium">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...lancamentos].reverse().map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-muted">{fmtData(l.data)}</td>
                  <td className="px-4 py-2.5">{CATEGORIA_LABEL[l.categoria]}</td>
                  <td className="px-4 py-2.5 text-muted">{l.descricao || "—"}</td>
                  <td className={`px-4 py-2.5 font-medium ${l.valor >= 0 ? "text-success" : "text-danger"}`}>
                    {l.valor >= 0 ? "+ " : "− "}
                    {fmt(Math.abs(l.valor))}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => remover(l.id)} aria-label="Remover lançamento" className="text-muted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Rendimento e comparação com o CDI são estimativas didáticas — o CDI usado é o acumulado real (fonte:
        Banco Central, série SGS 12) entre o primeiro lançamento e hoje; não substitui o cálculo de IR sobre
        aplicações financeiras nem considera custódia ou come-cotas.
      </p>
    </div>
  );
}
