"use client";

const INPUT_CLS = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm";
const LABEL_CLS = "mb-1 flex items-center gap-1.5 text-xs font-medium text-muted";

function Dot({ dedutivel }: { dedutivel: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${dedutivel ? "bg-success" : "bg-accent"}`}
      title={dedutivel ? "Dedutível do IR" : "Não dedutível"}
    />
  );
}

// Par de campos %/R$ sincronizados: editar o % recalcula o R$ (sobre `base`)
// e vice-versa. O ponto colorido indica se o custo entra na base de cálculo
// do imposto de renda (verde = dedutível, laranja = não dedutível).
export default function CustoPctRSInput({
  label,
  pct,
  base,
  dedutivel,
  onChange,
}: {
  label: string;
  pct: number;
  base: number;
  dedutivel: boolean;
  onChange: (pct: number) => void;
}) {
  const rs = (pct / 100) * base;
  return (
    <div>
      <label className={LABEL_CLS}>
        {label} (%) <Dot dedutivel={dedutivel} />
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={pct === 0 ? "" : pct}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={INPUT_CLS}
        />
        <span className="shrink-0 text-xs text-muted">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(rs)}</span>
      </div>
    </div>
  );
}
