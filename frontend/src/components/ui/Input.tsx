import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { composeDescriptionIds } from "@/lib/ui";

type FieldProps = {
  children: ReactNode;
  error?: string;
  helper?: string;
  id: string;
  label: string;
};

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  error?: string;
  helper?: string;
  id: string;
  label: string;
};

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  error?: string;
  helper?: string;
  id: string;
  label: string;
};

export function Field({ children, error, helper, id, label }: FieldProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="ds-field" htmlFor={id}>
      <span>{label}</span>
      {children}
      {helper ? (
        <span className="muted" id={helperId}>
          {helper}
        </span>
      ) : null}
      {error ? (
        <span className="ds-status ds-status--error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { error, helper, id, label, ...props },
  ref
) {
  return (
    <Field error={error} helper={helper} id={id} label={label}>
      <input {...fieldControlProps(id, helper, error)} ref={ref} {...props} />
    </Field>
  );
});

export function TextArea({ error, helper, id, label, ...props }: TextAreaProps) {
  return (
    <Field error={error} helper={helper} id={id} label={label}>
      <textarea {...fieldControlProps(id, helper, error)} {...props} />
    </Field>
  );
}

function fieldControlProps(id: string, helper?: string, error?: string) {
  return {
    "aria-describedby": composeDescriptionIds(
      helper ? `${id}-helper` : undefined,
      error ? `${id}-error` : undefined
    ),
    "aria-invalid": Boolean(error),
    id
  };
}
