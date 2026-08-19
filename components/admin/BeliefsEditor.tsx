"use client";

import { useId, useState } from "react";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { AboutBelief } from "@/lib/queries/about";

const SUGGESTED_CATEGORIES = [
  "La Biblia",
  "Dios",
  "Jesús",
  "El Espíritu Santo",
  "Salvación",
  "Santidad",
  "Bautismo",
  "Santa Cena",
  "Matrimonio",
  "Eternidad",
  "La Iglesia",
];

interface BeliefRowState extends AboutBelief {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
}

let keySeq = 0;
const nextKey = () => `belief-${Date.now()}-${keySeq++}`;

export function BeliefsEditor({ defaultBeliefs }: { defaultBeliefs: AboutBelief[] }) {
  const [rows, setRows] = useState<BeliefRowState[]>(() =>
    defaultBeliefs.map((b) => ({ ...b, key: nextKey() }))
  );
  const datalistId = useId();

  function updateRow(key: string, patch: Partial<AboutBelief>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), category: "", content: "", visible: true }]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function moveRow(index: number, direction: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name="beliefsCount" value={rows.length} />
      <datalist id={datalistId}>
        {SUGGESTED_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <TextField
                label={`Categoría ${i + 1}`}
                name={`beliefs.${i}.category`}
                defaultValue={row.category}
                onChange={(e) => updateRow(row.key, { category: e.target.value })}
                list={datalistId}
                required
              />
            </div>
            <div className="mt-6 flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => moveRow(i, -1)}
                disabled={i === 0}
                aria-label="Subir"
                className="rounded-md border border-border-strong px-2 py-1.5 text-xs text-ink-soft hover:bg-paper disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRow(i, 1)}
                disabled={i === rows.length - 1}
                aria-label="Bajar"
                className="rounded-md border border-border-strong px-2 py-1.5 text-xs text-ink-soft hover:bg-paper disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label="Eliminar categoría"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10"
              >
                Eliminar
              </button>
            </div>
          </div>

          <TextAreaField
            label="Contenido doctrinal"
            name={`beliefs.${i}.content`}
            defaultValue={row.content}
            onChange={(e) => updateRow(row.key, { content: e.target.value })}
            rows={3}
            hint="Vacío = no se muestra en /nosotros aunque esté marcada como visible."
          />

          <CheckboxField
            label="Visible en /nosotros"
            name={`beliefs.${i}.visible`}
            defaultChecked={row.visible}
            onChange={(e) => updateRow(row.key, { visible: e.target.checked })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
      >
        + Agregar categoría
      </button>
    </div>
  );
}
