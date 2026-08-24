"use client";

import { fmtShort } from "@/lib/format";
import { ParcelaAmortizacao } from "@/lib/financiamento";

// Reduz a tabela mensal (até centenas de linhas) para no máximo `pontos`
// amostras, mantendo sempre o primeiro e o último mês.
function amostrar(tabela: ParcelaAmortizacao[], pontos: number): ParcelaAmortizacao[] {
  if (tabela.length <= pontos) return tabela;
  const passo = (tabela.length - 1) / (pontos - 1);
  return Array.from({ length: pontos }, (_, i) => tabela[Math.round(i * passo)]);
}

export function ComposicaoParcelaChart({ tabela }: { tabela: ParcelaAmortizacao[] }) {
  const amostra = amostrar(tabela, 48);
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const max = Math.max(...amostra.map((p) => p.parcela + p.aporteExtra), 1);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const x = (i: number) => padding.left + (i / Math.max(amostra.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / max) * innerH;

  const linhaJuros = amostra.map((p, i) => `${x(i)},${y(p.juros)}`).join(" ");
  const linhaTotal = amostra.map((p, i) => `${x(i)},${y(p.juros + p.amortizacao)}`).join(" ");
  const areaJuros = `${padding.left},${padding.top + innerH} ${linhaJuros} ${padding.left + innerW},${padding.top + innerH}`;
  const areaAmortizacao = `${linhaJuros.split(" ").reverse().join(" ")} ${linhaTotal}`;

  const passoLabelX = Math.max(1, Math.ceil(amostra.length / 8));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Composição da parcela: juros e amortização ao longo do tempo">
        <polygon points={areaAmortizacao} fill="var(--brand)" opacity={0.18} />
        <polygon points={areaJuros} fill="var(--danger)" opacity={0.18} />
        <polyline points={linhaJuros} fill="none" stroke="var(--danger)" strokeWidth={2} />
        <polyline points={linhaTotal} fill="none" stroke="var(--brand)" strokeWidth={2} />

        {amostra.map((p, i) =>
          i % passoLabelX === 0 ? (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
              {p.mes}m
            </text>
          ) : null
        )}
        {[0, max / 2, max].map((v, i) => (
          <text key={i} x={padding.left - 8} y={y(v) + 3} textAnchor="end" fontSize={10} fill="var(--muted)">
            {fmtShort(v)}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-danger" /> Juros
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-brand" /> Amortização
        </span>
      </div>
    </div>
  );
}

export function SaldoDevedorChart({ tabela }: { tabela: ParcelaAmortizacao[] }) {
  const amostra = amostrar(tabela, 48);
  const width = 640;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const max = Math.max(...amostra.map((p) => p.saldoDevedorInicial), 1);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const x = (i: number) => padding.left + (i / Math.max(amostra.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / max) * innerH;

  const pontos = amostra.map((p, i) => `${x(i)},${y(p.saldoDevedorInicial)}`).join(" ");
  const area = `${padding.left},${padding.top + innerH} ${pontos} ${padding.left + innerW},${padding.top + innerH}`;
  const passoLabelX = Math.max(1, Math.ceil(amostra.length / 8));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Evolução do saldo devedor">
      <polygon points={area} fill="var(--brand)" opacity={0.1} />
      <polyline points={pontos} fill="none" stroke="var(--brand)" strokeWidth={2.5} />
      {amostra.map((p, i) =>
        i % passoLabelX === 0 ? (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
            {p.mes}m
          </text>
        ) : null
      )}
      {[0, max / 2, max].map((v, i) => (
        <text key={i} x={padding.left - 8} y={y(v) + 3} textAnchor="end" fontSize={10} fill="var(--muted)">
          {fmtShort(v)}
        </text>
      ))}
    </svg>
  );
}
