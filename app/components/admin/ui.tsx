import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

export const inputClass =
  "w-full px-3 py-2.5 bg-paper text-charcoal border-2 border-line outline-none focus:border-primary disabled:bg-mist";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-steel">{hint}</span>}
    </label>
  );
}

type Variant = "primary" | "dark" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-charcoal hover:bg-primary-dark",
  dark: "bg-charcoal text-paper hover:bg-graphite",
  ghost: "bg-paper text-charcoal border-2 border-line hover:border-charcoal",
  danger: "bg-paper text-danger border-2 border-danger hover:bg-danger hover:text-paper",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Notice({ kind, children }: { kind: "ok" | "error"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`border-l-4 px-4 py-3 bg-paper ${kind === "ok" ? "border-primary text-charcoal" : "border-danger text-danger"}`}
    >
      {children}
    </p>
  );
}

export function Panel({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-paper border border-line">
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-line">
          {title && <h2 className="text-xl font-semibold text-ink">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Two-step delete: the first click arms it, the second confirms; it disarms itself after 4s. */
export function ConfirmButton({
  onConfirm,
  label = "Eliminar",
  confirmLabel = "¿Seguro? Eliminar",
  disabled,
}: {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <Button
      variant="danger"
      disabled={disabled}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
