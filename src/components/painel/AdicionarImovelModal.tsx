"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { ETAPAS_PIPELINE, ETAPA_LABEL, EtapaPipeline } from "@/lib/types";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const LABEL_CLS = "mb-1 block text-xs font-medium text-muted";

export default function AdicionarImovelModal({ onCriado }: { onCriado: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [tipo, setTipo] = useState("Apartamento");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [avaliacao, setAvaliacao] = useState("");
  const [lance, setLance] = useState("");
  const [modalidade, setModalidade] = useState("Extrajudicial");
  const [leiloeiro, setLeiloeiro] = useState("");
  const [dataLeilao, setDataLeilao] = useState("");
  const [link, setLink] = useState("");
  const [foto, setFoto] = useState("");
  const [etapa, setEtapa] = useState<EtapaPipeline>("nao_iniciada");

  const resetar = () => {
    setTipo("Apartamento");
    setEndereco("");
    setBairro("");
    setCidade("");
    setEstado("SP");
    setAvaliacao("");
    setLance("");
    setModalidade("Extrajudicial");
    setLeiloeiro("");
    setDataLeilao("");
    setLink("");
    setFoto("");
    setEtapa("nao_iniciada");
    setErro(null);
  };

  const salvar = async () => {
    if (!endereco || !cidade || !estado || !link || !avaliacao || !lance) {
      setErro("Preencha ao menos endereço, cidade, estado, avaliação, lance e o link do leilão.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/imoveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          endereco,
          bairro,
          cidade,
          estado,
          avaliacao: Number(avaliacao),
          lance_minimo: Number(lance),
          modalidade,
          leiloeiro,
          data_leilao: dataLeilao || null,
          link,
          foto: foto || null,
          pipeline_etapa: etapa,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Falha ao salvar");
      resetar();
      setAberto(false);
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        <Plus size={16} /> Adicionar imóvel
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Adicionar imóvel</h2>
          <button onClick={() => setAberto(false)} className="text-muted hover:text-foreground" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {erro && <div className="mb-3 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">{erro}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={LABEL_CLS}>Link do leilão *</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className={INPUT_CLS} />
          </div>

          <div className="col-span-2">
            <label className={LABEL_CLS}>Endereço *</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Bairro</label>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Cidade *</label>
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Estado (UF) *</label>
            <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={INPUT_CLS}>
              {["Apartamento", "Casa", "Terreno", "Sala Comercial", "Galpão", "Kitnet", "Outro"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Valor de avaliação (R$) *</label>
            <input type="number" value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Lance mínimo (R$) *</label>
            <input type="number" value={lance} onChange={(e) => setLance(e.target.value)} className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Modalidade</label>
            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={INPUT_CLS}>
              <option value="Extrajudicial">Extrajudicial</option>
              <option value="Judicial">Judicial</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Leiloeiro / banco</label>
            <input value={leiloeiro} onChange={(e) => setLeiloeiro(e.target.value)} className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Data do leilão</label>
            <input type="date" value={dataLeilao} onChange={(e) => setDataLeilao(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Foto (URL)</label>
            <input value={foto} onChange={(e) => setFoto(e.target.value)} placeholder="https://..." className={INPUT_CLS} />
          </div>

          <div className="col-span-2">
            <label className={LABEL_CLS}>Etapa inicial</label>
            <select value={etapa} onChange={(e) => setEtapa(e.target.value as EtapaPipeline)} className={INPUT_CLS}>
              {ETAPAS_PIPELINE.map((e) => (
                <option key={e} value={e}>{ETAPA_LABEL[e]}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {salvando && <Loader2 size={15} className="animate-spin" />}
          Salvar imóvel
        </button>
      </div>
    </div>
  );
}
