"use client";

import { useState } from "react";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { EventPracticalInfoItem } from "@/types/content";

interface RowState extends EventPracticalInfoItem {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
}

let keySeq = 0;
const nextKey = () => `practical-${Date.now()}-${keySeq++}`;

/** Lista libre {título, contenido} — mismo patrón que BeliefsEditor (Nosotros), reutilizado aquí para "Qué llevar", "Transporte", "Punto de encuentro", etc. */
export function PracticalInfoEditor({ defaultItems }: { defaultItems: EventPracticalInfoItem[] }) {
  const [rows, setRows] = useState<RowState[]>(() =>
    defaultItems.map((item) => ({ ...item, key: nextKey() }))
  );

  function updateRow(key: string, patch: Partial<EventPracticalInfoItem>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), title: "", content: "" }]);
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
      <input type="hidden" name="practicalInfoCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <TextField
                label={`Título ${i + 1}`}
                name={`practicalInfo.${i}.title`}
                defaultValue={row.title}
                onChange={(e) => updateRow(row.key, { title: e.target.value })}
                placeholder="Ej: Qué llevar"
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
                aria-label="Eliminar dato práctico"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10"
              >
                Eliminar
              </button>
            </div>
          </div>

          <TextAreaField
            label="Contenido"
            name={`practicalInfo.${i}.content`}
            defaultValue={row.content}
            onChange={(e) => updateRow(row.key, { content: e.target.value })}
            rows={2}
            placeholder="Ej: Biblia, ropa cómoda, sleeping bag..."
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
      >
        + Agregar dato práctico
      </button>
    </div>
  );
}
