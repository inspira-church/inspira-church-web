"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
  /** Si se pasa, agrega un botón "Cancelar" junto al de guardar. */
  cancelHref?: string;
}

export function SubmitButton({ children, pendingText = "Guardando…", cancelHref }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? pendingText : children}
      </Button>
      {cancelHref && (
        <Button as={Link} href={cancelHref} variant="ghost">
          Cancelar
        </Button>
      )}
    </div>
  );
}
