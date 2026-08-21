"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/TextField";
import type { GenerationsJourneyStep } from "@/lib/queries/generations";

interface RowState extends GenerationsJourneyStep {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
}

let keySeq = 0;
const nextKey = () => `journey-${Date.now()}-${keySeq++}`;

/** Pasos del proceso "Un proceso para descubrir tu lugar" — el número (01, 02…) se calcula por posición, no se guarda. */
export function GenerationsJourneyEditor({ defaultSteps }: { defaultSteps: GenerationsJourneyStep[] }) {
  const [rows, setRows] = useState<RowState[]>(() => defaultSteps.map((s) => ({ ...s, key: nextKey() })));

  function updateRow(key: string, patch: Partial<GenerationsJourneyStep>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), title: "", when: "", text: "" }]);
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
      <input type="hidden" name="journeyCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="mt-1.5 text-sm font-semibold text-ink-faint">Paso {i + 1}</p>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => moveRow(i, -1)} disabled={i === 0}
                aria-label="Subir"
                className="rounded-md border border-border-strong px-2 py-1.5 text-xs text-ink-soft hover:bg-paper disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => moveRow(i, 1)} disabled={i === rows.length - 1}
                aria-label="Bajar"
                className="rounded-md border border-border-strong px-2 py-1.5 text-xs text-ink-soft hover:bg-paper disabled:opacity-30">
                ↓
              </button>
              <button type="button" onClick={() => removeRow(row.key)}
                aria-label="Eliminar paso"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10">
                Eliminar
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Título"
              name={`journey.${i}.title`}
              defaultValue={row.title}
              onChange={(e) => updateRow(row.key, { title: e.target.value })}
              required
            />
            <TextField
              label="Momento del año"
              name={`journey.${i}.when`}
              defaultValue={row.when}
              onChange={(e) => updateRow(row.key, { when: e.target.value })}
              hint="Opcional — ej. 'Primer semestre'."
            />
          </div>
          <TextField
            label="Texto"
            name={`journey.${i}.text`}
            defaultValue={row.text}
            onChange={(e) => updateRow(row.key, { text: e.target.value })}
            required
          />
        </div>
      ))}

      <button type="button" onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
        + Agregar paso
      </button>
    </div>
  );
}
