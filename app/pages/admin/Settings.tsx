import { useEffect, useMemo, useState } from "react";
import { useBlocker } from "react-router";
import type { Route } from "./+types/Settings";
import { adminFetch } from "../../lib/api";
import { Button, Field, Panel, inputClass } from "../../components/admin/ui";

type SettingRow = {
  key: string;
  section: string;
  kind: "text" | "textarea" | "markdown" | "url" | "email";
  label: string;
  value: string;
  display_order: number;
};

// sections in page order; anything else is listed after these
const SECTION_ORDER = ["Portada", "Nosotros", "Servicios", "Contacto", "Pie de página"];

export async function clientLoader() {
  const { data } = await adminFetch<{ data: SettingRow[] }>("/sitesettings");
  return { rows: data };
}

export default function AdminSettings({ loaderData }: Route.ComponentProps) {
  const [saved, setSaved] = useState<Record<string, string>>(() =>
    Object.fromEntries(loaderData.rows.map((r) => [r.key, r.value])),
  );
  const [draft, setDraft] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sections = useMemo(() => {
    const groups = new Map<string, SettingRow[]>();
    for (const row of loaderData.rows) {
      const list = groups.get(row.section) ?? [];
      list.push(row);
      groups.set(row.section, list);
    }
    const rank = (s: string) => (SECTION_ORDER.includes(s) ? SECTION_ORDER.indexOf(s) : SECTION_ORDER.length);
    return [...groups.entries()]
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
      .map(([name, rows]) => [name, rows.sort((a, b) => a.display_order - b.display_order)] as const);
  }, [loaderData.rows]);

  const changed = Object.keys(draft).filter((k) => draft[k] !== saved[k]);
  const dirty = changed.length > 0;

  // warn before leaving with unsaved edits (in-app navigation and tab close)
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const values = Object.fromEntries(changed.map((k) => [k, draft[k]]));
      await adminFetch("/sitesettings", { method: "PUT", body: JSON.stringify({ values }) });
      setSaved({ ...saved, ...values });
      setNotice({ kind: "ok", text: `Cambios guardados (${changed.length}). Ya se ven en el sitio.` });
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "No se pudo guardar." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-ink">Textos del sitio</h1>
        <p className="mt-2 text-steel">
          Edita los textos y presiona <strong>Guardar cambios</strong>. Los cambios se publican al instante.
        </p>
      </div>

      {blocker.state === "blocked" && (
        <div className="flex flex-wrap items-center gap-3 border-l-4 border-primary bg-paper px-4 py-3">
          <span className="flex-1">Tienes cambios sin guardar. ¿Salir de todas formas?</span>
          <Button variant="ghost" onClick={() => blocker.reset()}>
            Quedarme
          </Button>
          <Button variant="danger" onClick={() => blocker.proceed()}>
            Salir sin guardar
          </Button>
        </div>
      )}

      {sections.map(([name, rows]) => (
        <Panel key={name} title={name}>
          {rows.map((row) => (
            <SettingInput
              key={row.key}
              row={row}
              value={draft[row.key] ?? ""}
              changed={draft[row.key] !== saved[row.key]}
              onChange={(value) => setDraft((d) => ({ ...d, [row.key]: value }))}
            />
          ))}
        </Panel>
      ))}

      {/* sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-charcoal border-t-4 border-primary pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-300 mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-paper min-w-0 flex-1">
            {notice ? (
              <span className={notice.kind === "error" ? "text-primary" : "text-paper"}>{notice.text}</span>
            ) : dirty ? (
              `${changed.length} cambio(s) sin guardar`
            ) : (
              "Sin cambios pendientes"
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={!dirty || busy} onClick={() => (setDraft(saved), setNotice(null))}>
              Descartar
            </Button>
            <Button disabled={!dirty || busy} onClick={save}>
              {busy ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingInput({
  row,
  value,
  changed,
  onChange,
}: {
  row: SettingRow;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
}) {
  const cls = `${inputClass} ${changed ? "border-primary" : ""}`;
  const hint =
    row.kind === "markdown"
      ? "Usa **texto** para negrita. Deja una línea en blanco para separar párrafos."
      : row.kind === "url"
        ? "Dirección completa, por ejemplo https://..."
        : undefined;

  return (
    <Field label={row.label} hint={hint}>
      {row.kind === "textarea" || row.kind === "markdown" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={row.kind === "markdown" ? 8 : 3}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          type={row.kind === "email" ? "email" : row.kind === "url" ? "url" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </Field>
  );
}
