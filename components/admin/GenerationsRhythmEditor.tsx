"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/TextField";
import type { GenerationsRhythmWord } from "@/lib/queries/generations";

interface RowState extends GenerationsRhythmWord {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
}

let keySeq = 0;
const nextKey = () => `rhythm-${Date.now()}-${keySeq++}`;

/** Palabras del bloque "Prepárate · Practica · Sirve · Crece". */
export function GenerationsRhythmEditor({ defaultWords }: { defaultWords: GenerationsRhythmWord[] }) {
  const [rows, setRows] = useState<RowState[]>(() => defaultWords.map((w) => ({ ...w, key: nextKey() })));

  function updateRow(key: string, patch: Partial<GenerationsRhythmWord>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), word: "", text: "" }]);
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
      <input type="hidden" name="rhythmCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <TextField
                label={`Palabra ${i + 1}`}
                name={`rhythm.${i}.word`}
                defaultValue={row.word}
                onChange={(e) => updateRow(row.key, { word: e.target.value })}
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
                aria-label="Eliminar palabra"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10">
                Eliminar
              </button>
            </div>
          </div>
          <TextField
            label="Texto"
            name={`rhythm.${i}.text`}
            defaultValue={row.text}
            onChange={(e) => updateRow(row.key, { text: e.target.value })}
            required
          />
        </div>
      ))}

      <button type="button" onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
        + Agregar palabra
      </button>
    </div>
  );
}
