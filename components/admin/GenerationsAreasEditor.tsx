"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { generationsAreaPhotoModule } from "@/lib/generations-photo-modules";
import type { GenerationsArea, GenerationsAreaGroup } from "@/lib/queries/generations";

interface GroupRowState extends GenerationsAreaGroup {
  key: string;
}

interface AreaRowState extends Omit<GenerationsArea, "groups"> {
  /** Solo para la key de React en esta sesión de edición — nunca se envía al servidor. */
  key: string;
  groups: GroupRowState[];
}

let keySeq = 0;
const nextKey = (prefix: string) => `${prefix}-${Date.now()}-${keySeq++}`;

function GroupsEditor({
  areaIndex,
  groups,
  onChange,
}: {
  areaIndex: number;
  groups: GroupRowState[];
  onChange: (groups: GroupRowState[]) => void;
}) {
  function updateGroup(key: string, patch: Partial<GenerationsAreaGroup>) {
    onChange(groups.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  }

  function addGroup() {
    onChange([...groups, { key: nextKey("group"), label: "", age: "", when: "", practice: "" }]);
  }

  function removeGroup(key: string) {
    onChange(groups.filter((g) => g.key !== key));
  }

  return (
    <div className="space-y-3 rounded-lg border border-border-strong/60 bg-paper p-3">
      <input type="hidden" name={`areas.${areaIndex}.groupsCount`} value={groups.length} />
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Horarios / subgrupos
      </p>

      {groups.map((group, j) => (
        <div key={group.key} className="space-y-2.5 rounded-md border border-border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="grid flex-1 gap-2.5 sm:grid-cols-2">
              <TextField
                label="Etiqueta (opcional)"
                name={`areas.${areaIndex}.groups.${j}.label`}
                defaultValue={group.label}
                onChange={(e) => updateGroup(group.key, { label: e.target.value })}
                hint="Ej: 'Voces' cuando un área tiene más de un subgrupo."
              />
              <TextField
                label="Edad"
                name={`areas.${areaIndex}.groups.${j}.age`}
                defaultValue={group.age}
                onChange={(e) => updateGroup(group.key, { age: e.target.value })}
                required
              />
              <TextField
                label="Horario"
                name={`areas.${areaIndex}.groups.${j}.when`}
                defaultValue={group.when}
                onChange={(e) => updateGroup(group.key, { when: e.target.value })}
                required
              />
              <TextField
                label="Práctica (opcional)"
                name={`areas.${areaIndex}.groups.${j}.practice`}
                defaultValue={group.practice}
                onChange={(e) => updateGroup(group.key, { practice: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeGroup(group.key)}
              disabled={groups.length <= 1}
              aria-label="Eliminar horario"
              className="mt-6 shrink-0 rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10 disabled:opacity-30"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-raised"
      >
        + Agregar horario
      </button>
    </div>
  );
}

/**
 * La pieza más compleja del panel: lista de áreas y, dentro de cada una,
 * una sub-lista anidada de horarios — dos niveles de BeliefsEditor, uno
 * dentro del otro. `id` es estable (no se recalcula al renombrar el área)
 * porque alimenta el módulo de foto `generaciones-area-{id}`.
 */
export function GenerationsAreasEditor({
  defaultAreas,
  mediaMap,
}: {
  defaultAreas: GenerationsArea[];
  mediaMap: Record<string, string>;
}) {
  const [rows, setRows] = useState<AreaRowState[]>(() =>
    defaultAreas.map((area) => ({
      ...area,
      key: nextKey("area"),
      groups: area.groups.map((g) => ({ ...g, key: nextKey("group") })),
    }))
  );

  function updateRow(key: string, patch: Partial<Omit<GenerationsArea, "groups">>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function setGroups(key: string, groups: GroupRowState[]) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, groups } : r)));
  }

  function addRow() {
    const id = `area-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        key: nextKey("area"),
        id,
        name: "",
        tags: "",
        purpose: "",
        groups: [{ key: nextKey("group"), label: "", age: "", when: "", practice: "" }],
      },
    ]);
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
    <div className="space-y-6">
      <input type="hidden" name="areasCount" value={rows.length} />

      {rows.map((row, i) => (
        <div key={row.key} className="space-y-4 rounded-lg border border-border p-4">
          <input type="hidden" name={`areas.${i}.id`} value={row.id} />

          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-ink">Área {i + 1}</p>
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
                aria-label="Eliminar área"
                className="rounded-md border border-danger/40 px-2 py-1.5 text-xs text-danger hover:bg-danger/10">
                Eliminar
              </button>
            </div>
          </div>

          <div className="max-w-xs">
            <ImageUploadField
              label="Foto"
              name={`_generaciones_area_${i}`}
              bucket="site"
              module={generationsAreaPhotoModule(row.id)}
              defaultValue={mediaMap[generationsAreaPhotoModule(row.id)] ?? null}
              hint="Opcional"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre"
              name={`areas.${i}.name`}
              defaultValue={row.name}
              onChange={(e) => updateRow(row.key, { name: e.target.value })}
              required
            />
            <TextField
              label="Etiquetas"
              name={`areas.${i}.tags`}
              defaultValue={row.tags}
              onChange={(e) => updateRow(row.key, { tags: e.target.value })}
              hint="Ej: 'Adoración · Disciplina · Sensibilidad'"
              required
            />
          </div>

          <TextAreaField
            label="Propósito"
            name={`areas.${i}.purpose`}
            defaultValue={row.purpose}
            onChange={(e) => updateRow(row.key, { purpose: e.target.value })}
            rows={2}
            required
          />

          <GroupsEditor areaIndex={i} groups={row.groups} onChange={(groups) => setGroups(row.key, groups)} />
        </div>
      ))}

      <button type="button" onClick={addRow}
        className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
        + Agregar área
      </button>
    </div>
  );
}
