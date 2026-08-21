"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/TextField";

interface RowState {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
  text: string;
}

let keySeq = 0;
const nextKey = () => `safety-${Date.now()}-${keySeq++}`;

/** Lista simple de principios de cuidado y seguridad — sin categoría ni visibilidad, el fork más simple de BeliefsEditor. */
export function GenerationsSafetyEditor({ defaultPrinciples }: { defaultPrinciples: string[] }) {
  const [rows, setRows] = useState<RowState[]>(() =>
    defaultPrinciples.map((text) => ({ key: nextKey(), text }))
  );

  function updateRow(key: string, text: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, text } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), text: "" }]);
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
    <div className="space-y-3">
      <input type="hidden" name="safetyPrinciplesCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="flex items-start gap-3">
          <div className="flex-1">
            <TextField
              label={`Principio ${i + 1}`}
              name={`safetyPrinciples.${i}`}
              defaultValue={row.text}
              onChange={(e) => updateRow(row.key, e.target.value)}
              required
            />
          </div>
          <div className="mt-6 flex shrink-0 items-center gap-1">
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
              aria-label="Eliminar principio"
              className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10">
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
        + Agregar principio
      </button>
    </div>
  );
}
