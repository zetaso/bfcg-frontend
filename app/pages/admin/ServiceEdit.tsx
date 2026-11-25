import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/ServiceEdit";
import { adminFetch, uploadImage } from "../../lib/api";
import { Button, ConfirmButton, Field, Notice, Panel, inputClass } from "../../components/admin/ui";
import type { Highlight, Service } from "./Services";

const EMPTY: Omit<Service, "id" | "display_order"> = {
  slug: "",
  title: "",
  short_description: "",
  full_description: "",
  price_text: "",
  duration_text: "",
  image_url: "",
  is_active: true,
};

const HIGHLIGHT_TYPES: { value: Highlight["item_type"]; label: string }[] = [
  { value: "benefit", label: "Beneficio" },
  { value: "step", label: "Paso del proceso" },
  { value: "faq", label: "Pregunta frecuente" },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.id === "new") return { service: null };
  const { data } = await adminFetch<{ data: Service }>(`/services/${params.id}`);
  return { service: data };
}

const message = (err: unknown) => (err instanceof Error ? err.message : "Ocurrió un error.");

export default function AdminServiceEdit({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const initial = loaderData.service;
  const isNew = !initial;

  const [form, setForm] = useState(() => ({ ...EMPTY, ...stripNulls(initial) }));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      set("image_url", await uploadImage(file));
    } catch (err) {
      setNotice({ kind: "error", text: message(err) });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const { highlights, ...body } = form as typeof form & { highlights?: unknown };
    try {
      if (isNew) {
        const { data } = await adminFetch<{ data: Service }>("/services", {
          method: "POST",
          body: JSON.stringify(body),
        });
        navigate(`/admin/services/${data.id}`, { replace: true });
      } else {
        const { data } = await adminFetch<{ data: Service }>(`/services/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setForm({ ...EMPTY, ...stripNulls(data) });
        setNotice({ kind: "ok", text: "Servicio guardado." });
      }
    } catch (err) {
      setNotice({ kind: "error", text: message(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link to="/admin/services" className="self-start text-sm text-steel hover:text-charcoal">
          ← Volver a servicios
        </Link>
        <h1 className="text-3xl font-bold text-ink">{isNew ? "Nuevo servicio" : form.title || "Editar servicio"}</h1>
        {!isNew && form.is_active && (
          <a
            href={`/services/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="self-start text-sm font-semibold text-charcoal underline underline-offset-4 hover:text-primary-dark"
          >
            Ver en el sitio
          </a>
        )}
      </div>

      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <form onSubmit={onSubmit}>
        <Panel
          title="Información"
          actions={
            <Button type="submit" disabled={busy || uploading}>
              {busy ? "Guardando..." : isNew ? "Crear servicio" : "Guardar"}
            </Button>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Título *">
              <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
            </Field>
            <Field
              label="Dirección en el sitio"
              hint={isNew ? "Opcional. Si lo dejas vacío se genera desde el título." : "Cambiarla rompe los enlaces ya compartidos."}
            >
              <div className="flex items-stretch">
                <span className="px-3 flex items-center bg-mist border-2 border-r-0 border-line text-sm text-steel">
                  /services/
                </span>
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
              </div>
            </Field>
          </div>

          <Field label="Descripción corta *" hint="Se muestra en la lista de servicios.">
            <textarea
              required
              rows={3}
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Descripción completa" hint="Se muestra en la página del servicio. Los saltos de línea se respetan.">
            <textarea
              rows={8}
              value={form.full_description ?? ""}
              onChange={(e) => set("full_description", e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Precio" hint='Texto libre, por ejemplo "Desde $150.000" o "A convenir".'>
              <input value={form.price_text ?? ""} onChange={(e) => set("price_text", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Duración" hint='Texto libre, por ejemplo "8 horas".'>
              <input
                value={form.duration_text ?? ""}
                onChange={(e) => set("duration_text", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Imagen">
            <div className="flex flex-wrap items-start gap-4">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="h-32 w-56 object-cover border border-line" />
              ) : (
                <div className="h-32 w-56 bg-mist border-2 border-dashed border-line flex items-center justify-center text-sm text-steel">
                  Sin imagen
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
                <Button variant="dark" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? "Subiendo..." : form.image_url ? "Cambiar imagen" : "Subir imagen"}
                </Button>
                {form.image_url && (
                  <Button variant="ghost" disabled={uploading} onClick={() => set("image_url", "")}>
                    Quitar imagen
                  </Button>
                )}
                <span className="text-xs text-steel">JPG, PNG o WebP. Máximo 5 MB.</span>
              </div>
            </div>
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            <span className="font-semibold text-ink">Visible en el sitio</span>
          </label>
        </Panel>
      </form>

      {isNew ? (
        <p className="text-steel">Guarda el servicio para poder agregarle beneficios, pasos y preguntas frecuentes.</p>
      ) : (
        <Highlights serviceId={initial.id} initial={initial.highlights ?? []} />
      )}
    </div>
  );
}

function Highlights({ serviceId, initial }: { serviceId: string; initial: Highlight[] }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  return (
    <Panel
      title="Detalles del servicio"
      actions={
        !adding && (
          <Button variant="dark" onClick={() => setAdding(true)}>
            + Agregar detalle
          </Button>
        )
      }
    >
      <p className="text-sm text-steel -mt-1">
        Se muestran en la página del servicio agrupados por tipo, en desplegables.
      </p>

      {adding && (
        <HighlightForm
          serviceId={serviceId}
          nextOrder={(items.at(-1)?.display_order ?? 0) + 1}
          onSaved={(h) => {
            setItems((list) => [...list, h]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {items.length === 0 && !adding && <p className="text-steel">Aún no hay detalles.</p>}

      {items.map((h) => (
        <HighlightForm
          key={h.id}
          serviceId={serviceId}
          highlight={h}
          onSaved={(saved) => setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)))}
          onDeleted={() => setItems((list) => list.filter((x) => x.id !== h.id))}
        />
      ))}
    </Panel>
  );
}

function HighlightForm({
  serviceId,
  highlight,
  nextOrder,
  onSaved,
  onDeleted,
  onCancel,
}: {
  serviceId: string;
  highlight?: Highlight;
  nextOrder?: number;
  onSaved: (h: Highlight) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState({
    item_type: highlight?.item_type ?? ("benefit" as Highlight["item_type"]),
    title: highlight?.title ?? "",
    content: highlight?.content ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty =
    !highlight ||
    draft.item_type !== highlight.item_type ||
    draft.title !== (highlight.title ?? "") ||
    draft.content !== highlight.content;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = highlight
        ? await adminFetch<{ data: Highlight }>(`/highlights/${highlight.id}`, {
            method: "PUT",
            body: JSON.stringify(draft),
          })
        : await adminFetch<{ data: Highlight }>(`/services/${serviceId}/highlights`, {
            method: "POST",
            body: JSON.stringify({ ...draft, display_order: nextOrder }),
          });
      onSaved(data);
      if (highlight) {
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
    if (!highlight) return;
    setBusy(true);
    setError(null);
    try {
      await adminFetch(`/highlights/${highlight.id}`, { method: "DELETE" });
      onDeleted?.();
    } catch (err) {
      setError(message(err));
      setBusy(false);
    }
  };

  return (
    <div className={`border-2 p-5 flex flex-col gap-4 ${highlight ? "border-line" : "border-primary bg-primary-soft"}`}>
      <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
        <Field label="Tipo">
          <select
            value={draft.item_type}
            onChange={(e) => setDraft((d) => ({ ...d, item_type: e.target.value as Highlight["item_type"] }))}
            className={inputClass}
          >
            {HIGHLIGHT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título (opcional)">
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Contenido *">
        <textarea
          rows={3}
          value={draft.content}
          onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          className={`${inputClass} resize-y`}
        />
      </Field>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy || !dirty || !draft.content.trim()} onClick={save}>
          {busy ? "Guardando..." : highlight ? "Guardar" : "Agregar"}
        </Button>
        {onCancel && (
          <Button variant="ghost" disabled={busy} onClick={onCancel}>
            Cancelar
          </Button>
        )}
        {savedFlash && <span className="text-sm font-semibold text-charcoal">✓ Guardado</span>}
        {highlight && (
          <span className="ml-auto">
            <ConfirmButton disabled={busy} onConfirm={remove} />
          </span>
        )}
      </div>
    </div>
  );
}

/** API returns nulls for empty optional columns; the form works with strings. */
function stripNulls(service: Service | null) {
  if (!service) return {};
  return Object.fromEntries(Object.entries(service).map(([k, v]) => [k, v ?? ""])) as Partial<Service>;
}
