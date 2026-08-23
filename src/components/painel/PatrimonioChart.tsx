"use client";

import { fmtShort } from "@/lib/format";

export default function PatrimonioChart({ valores }: { valores: number[] }) {
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores, 0);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const x = (i: number) => padding.left + (i / Math.max(valores.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - ((v - min) / Math.max(max - min, 1)) * innerH;

  const points = valores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + innerH} ${points} ${padding.left + innerW},${padding.top + innerH}`;

  const ticksY = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Projeção de evolução do patrimônio">
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

      <polygon points={areaPoints} fill="var(--brand)" opacity={0.08} />
      <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {valores.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="var(--brand)" />
      ))}

      {valores.map((_, i) => (
        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
          {i === 0 ? "Hoje" : `${i}a`}
        </text>
      ))}
    </svg>
  );
}
