"use client";

import type { ReactNode } from "react";

interface ConfirmFormProps {
  action: (formData: FormData) => void;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
}

/** Envuelve una Server Action con un window.confirm() antes de enviarla — para acciones irreversibles (borrar). */
export function ConfirmForm({ action, confirmMessage, className, children }: ConfirmFormProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </form>
  );
}
