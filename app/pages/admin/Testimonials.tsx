import { useState } from "react";
import type { Route } from "./+types/Testimonials";
import { adminFetch } from "../../lib/api";
import { Button, ConfirmButton, Field, Notice, inputClass } from "../../components/admin/ui";
import type { Service } from "./Services";

type Testimonial = {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
  service_id: string | null;
  is_featured: boolean;
  display_order: number;
};

type Draft = Pick<Testimonial, "client_name" | "quote" | "is_featured"> & {
  client_role: string;
  service_id: string;
};

const toDraft = (t?: Testimonial): Draft => ({
  client_name: t?.client_name ?? "",
  client_role: t?.client_role ?? "",
  quote: t?.quote ?? "",
  service_id: t?.service_id ?? "",
  is_featured: t?.is_featured ?? true,
});

const message = (err: unknown) => (err instanceof Error ? err.message : "Ocurrió un error.");

export async function clientLoader() {
  const [testimonials, services] = await Promise.all([
    adminFetch<{ data: Testimonial[] }>("/testimonials"),
    adminFetch<{ data: Service[] }>("/services"),
  ]);
  return {
    testimonials: testimonials.data,
    services: services.data.map((s) => ({ id: s.id, title: s.title })),
  };
}

export default function AdminTestimonials({ loaderData }: Route.ComponentProps) {
  const [items, setItems] = useState(loaderData.testimonials);
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = async (index: number, delta: -1 | 1) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setItems(next);
    setMoving(true);
    setError(null);
    try {
      await adminFetch("/testimonials/order", { method: "PUT", body: JSON.stringify({ ids: next.map((t) => t.id) }) });
    } catch (err) {
      setError(message(err));
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Testimonios</h1>
          <p className="mt-2 text-steel">
            Solo los marcados como visibles aparecen en el sitio. Si no hay ninguno visible, la sección se oculta.
          </p>
        </div>
        {!adding && <Button onClick={() => setAdding(true)}>+ Nuevo testimonio</Button>}
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {adding && (
        <TestimonialForm
          services={loaderData.services}
          onSaved={(t) => {
            setItems((list) => [...list, t]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {items.length === 0 && !adding && (
        <p className="bg-paper border border-line p-8 text-steel">Aún no hay testimonios.</p>
      )}

      {items.map((t, i) => (
        <div key={t.id} className="flex gap-3 items-start">
          <div className="flex flex-col pt-1">
            <button
              type="button"
              aria-label="Subir"
              disabled={i === 0 || moving}
              onClick={() => move(i, -1)}
              className="h-7 w-8 bg-paper border border-line text-xs hover:bg-charcoal hover:text-paper disabled:opacity-30 disabled:hover:bg-paper disabled:hover:text-charcoal"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Bajar"
              disabled={i === items.length - 1 || moving}
              onClick={() => move(i, 1)}
              className="h-7 w-8 bg-paper border border-t-0 border-line text-xs hover:bg-charcoal hover:text-paper disabled:opacity-30 disabled:hover:bg-paper disabled:hover:text-charcoal"
            >
              ▼
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <TestimonialForm
              testimonial={t}
              services={loaderData.services}
              onSaved={(saved) => setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)))}
              onDeleted={() => setItems((list) => list.filter((x) => x.id !== t.id))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialForm({
  testimonial,
  services,
  onSaved,
  onDeleted,
  onCancel,
}: {
  testimonial?: Testimonial;
  services: { id: string; title: string }[];
  onSaved: (t: Testimonial) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(() => toDraft(testimonial));
  const [base, setBase] = useState(() => toDraft(testimonial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const dirty = !testimonial || (Object.keys(draft) as (keyof Draft)[]).some((k) => draft[k] !== base[k]);
  const valid = draft.client_name.trim() && draft.quote.trim();

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = testimonial
        ? await adminFetch<{ data: Testimonial }>(`/testimonials/${testimonial.id}`, {
            method: "PUT",
            body: JSON.stringify(draft),
          })
        : await adminFetch<{ data: Testimonial }>("/testimonials", { method: "POST", body: JSON.stringify(draft) });
      onSaved(data);
      if (testimonial) {
        setBase(toDraft(data));
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!testimonial) return;
    setBusy(true);
    setError(null);
    try {
      await adminFetch(`/testimonials/${testimonial.id}`, { method: "DELETE" });
      onDeleted?.();
    } catch (err) {
      setError(message(err));
      setBusy(false);
    }
  };

  return (
    <div
      className={`border-2 p-6 flex flex-col gap-4 ${
        testimonial ? `bg-paper border-line ${base.is_featured ? "" : "opacity-70"}` : "bg-primary-soft border-primary"
      }`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nombre del cliente *">
          <input value={draft.client_name} onChange={(e) => set("client_name", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Cargo o empresa">
          <input value={draft.client_role} onChange={(e) => set("client_role", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Servicio relacionado">
          <select value={draft.service_id} onChange={(e) => set("service_id", e.target.value)} className={inputClass}>
            <option value="">Ninguno</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Testimonio *">
        <textarea
          rows={4}
          value={draft.quote}
          onChange={(e) => set("quote", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-3 cursor-pointer select-none self-start">
        <input
          type="checkbox"
          checked={draft.is_featured}
          onChange={(e) => set("is_featured", e.target.checked)}
          className="h-5 w-5 accent-primary"
        />
        <span className="font-semibold text-ink">Visible en el sitio</span>
      </label>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy || !dirty || !valid} onClick={save}>
          {busy ? "Guardando..." : testimonial ? "Guardar" : "Agregar"}
        </Button>
        {onCancel && (
          <Button variant="ghost" disabled={busy} onClick={onCancel}>
            Cancelar
          </Button>
        )}
        {savedFlash && <span className="text-sm font-semibold text-charcoal">✓ Guardado</span>}
        {testimonial && (
          <span className="ml-auto">
            <ConfirmButton disabled={busy} onConfirm={remove} />
          </span>
        )}
      </div>
    </div>
  );
}
