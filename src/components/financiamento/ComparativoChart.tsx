"use client";

import { fmtShort } from "@/lib/format";
import { PontoComparativo } from "@/lib/financiamento";

export default function ComparativoChart({ pontos }: { pontos: PontoComparativo[] }) {
  const width = 640;
  const height = 240;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const todosValores = pontos.flatMap((p) => [p.patrimonioCompra, p.patrimonioAlugar]);
  const max = Math.max(...todosValores, 1);
  const min = Math.min(...todosValores, 0);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const x = (i: number) => padding.left + (i / Math.max(pontos.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - ((v - min) / Math.max(max - min, 1)) * innerH;

  const linha = (get: (p: PontoComparativo) => number) => pontos.map((p, i) => `${x(i)},${y(get(p))}`).join(" ");

  const ticksY = 4;
  const passoLabelX = Math.max(1, Math.ceil(pontos.length / 10));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Comparativo de patrimônio: comprar vs. alugar e investir">
        {Array.from({ length: ticksY + 1 }, (_, i) => {
          const v = min + ((max - min) * i) / ticksY;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={yy} y2={yy} stroke="var(--border)" strokeWidth={1} />
              <text x={padding.left - 8} y={yy + 3} textAnchor="end" fontSize={10} fill="var(--muted)">
                {fmtShort(v)}
              </text>
            </g>
          );
        })}

        <polyline points={linha((p) => p.patrimonioCompra)} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={linha((p) => p.patrimonioAlugar)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {pontos.map((p, i) =>
          i % passoLabelX === 0 ? (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
              {p.ano === 0 ? "Hoje" : `${p.ano}a`}
            </text>
          ) : null
        )}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-brand" /> Comprar financiado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" /> Alugar + investir a diferença
        </span>
      </div>
    </div>
  );
}
