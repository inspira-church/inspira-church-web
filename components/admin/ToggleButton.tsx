"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/form-errors";

interface ToggleButtonProps {
  /** Server Action de un interruptor ya enlazada con `.bind(null, id, siguienteValor)`. */
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** Texto del botón: "Ocultar", "Publicar", "Desactivar"… */
  children: React.ReactNode;
}

const initialState: ActionState = {};

/**
 * Botón de interruptor (ocultar/mostrar, activar/desactivar, publicar/
 * despublicar) que muestra el error si la escritura falló. Antes era un
 * <form action> en una página de servidor: el resultado de la acción se
 * descartaba y un fallo se veía igual que un éxito.
 */
export function ToggleButton({ action, children }: ToggleButtonProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end">
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-ink-soft hover:text-ink disabled:opacity-50"
      >
        {children}
      </button>
      {state.error && (
        <p role="alert" className="mt-1 max-w-48 text-right text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
