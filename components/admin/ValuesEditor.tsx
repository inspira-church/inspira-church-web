"use client";

import { useState } from "react";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { AboutValue } from "@/lib/queries/about";

interface ValueRowState extends AboutValue {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
}

let keySeq = 0;
const nextKey = () => `value-${Date.now()}-${keySeq++}`;

export function ValuesEditor({ defaultValues }: { defaultValues: AboutValue[] }) {
  const [rows, setRows] = useState<ValueRowState[]>(() =>
    defaultValues.map((v) => ({ ...v, key: nextKey() }))
  );

  function updateRow(key: string, patch: Partial<AboutValue>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey(), title: "", description: "", visible: true }]);
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
    <div className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="valuesCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <TextField
                label={`Valor ${i + 1} — título`}
                name={`values.${i}.title`}
                defaultValue={row.title}
                onChange={(e) => updateRow(row.key, { title: e.target.value })}
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
                aria-label="Eliminar valor"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10"
              >
                Eliminar
              </button>
            </div>
          </div>

          <TextAreaField
            label="Descripción"
            name={`values.${i}.description`}
            defaultValue={row.description}
            onChange={(e) => updateRow(row.key, { description: e.target.value })}
            rows={2}
            hint="Vacía = no se muestra en /nosotros aunque esté marcado como visible."
          />

          <CheckboxField
            label="Visible en /nosotros"
            name={`values.${i}.visible`}
            defaultChecked={row.visible}
            onChange={(e) => updateRow(row.key, { visible: e.target.checked })}
          />
        </div>
      ))}

      <div className="sm:col-span-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
        >
          + Agregar valor
        </button>
      </div>
    </div>
  );
}
