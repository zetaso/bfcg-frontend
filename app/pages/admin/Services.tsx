import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/Services";
import { adminFetch } from "../../lib/api";
import { Button, ConfirmButton, Notice } from "../../components/admin/ui";

export type Highlight = {
  id: string;
  service_id: string;
  item_type: "benefit" | "step" | "faq";
  title: string | null;
  content: string;
  display_order: number;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string | null;
  price_text: string | null;
  duration_text: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  highlights?: Highlight[];
};

export async function clientLoader() {
  const { data } = await adminFetch<{ data: Service[] }>("/services");
  return { services: data };
}

export default function AdminServices({ loaderData }: Route.ComponentProps) {
  const [services, setServices] = useState(loaderData.services);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (s: Service) =>
    run(s.id, async () => {
      const { data } = await adminFetch<{ data: Service }>(`/services/${s.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !s.is_active }),
      });
      setServices((list) => list.map((x) => (x.id === s.id ? data : x)));
    });

  const move = (index: number, delta: -1 | 1) =>
    run(services[index].id, async () => {
      const next = [...services];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      setServices(next);
      await adminFetch("/services/order", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((s) => s.id) }),
      });
    });

  const remove = (s: Service) =>
    run(s.id, async () => {
      await adminFetch(`/services/${s.id}`, { method: "DELETE" });
      setServices((list) => list.filter((x) => x.id !== s.id));
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Servicios</h1>
          <p className="mt-2 text-steel">
            Los servicios ocultos no aparecen en el sitio. Usa las flechas para cambiar el orden.
          </p>
        </div>
        <Link
          to="/admin/services/new"
          className="px-5 py-3 bg-primary text-charcoal text-sm font-bold uppercase tracking-wide hover:bg-primary-dark"
        >
          + Nuevo servicio
        </Link>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {services.length === 0 ? (
        <p className="bg-paper border border-line p-8 text-steel">Aún no hay servicios.</p>
      ) : (
        <ul className="flex flex-col gap-px bg-line border border-line">
          {services.map((s, i) => (
            <li key={s.id} className={`bg-paper flex flex-wrap items-center gap-4 p-4 ${s.is_active ? "" : "opacity-60"}`}>
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Subir"
                  disabled={i === 0 || busyId !== null}
                  onClick={() => move(i, -1)}
                  className="h-7 w-8 border border-line text-xs hover:bg-charcoal hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal"
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  disabled={i === services.length - 1 || busyId !== null}
                  onClick={() => move(i, 1)}
                  className="h-7 w-8 border border-t-0 border-line text-xs hover:bg-charcoal hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal"
                >
                  ▼
                </button>
              </div>

              {s.image_url ? (
                <img src={s.image_url} alt="" loading="lazy" decoding="async" className="h-14 w-20 object-cover border border-line" />
              ) : (
                <div className="h-14 w-20 bg-mist border border-line" />
              )}

              <div className="flex-1 min-w-48">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-ink">{s.title}</h2>
                  {!s.is_active && (
                    <span className="px-2 py-0.5 text-xs font-bold uppercase bg-mist text-steel">Oculto</span>
                  )}
                </div>
                <p className="text-sm text-steel line-clamp-1">{s.short_description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" disabled={busyId === s.id} onClick={() => toggleActive(s)}>
                  {s.is_active ? "Ocultar" : "Mostrar"}
                </Button>
                <Link
                  to={`/admin/services/${s.id}`}
                  className="px-4 flex items-center text-sm font-bold uppercase tracking-wide bg-charcoal text-paper hover:bg-graphite"
                >
                  Editar
                </Link>
                <ConfirmButton disabled={busyId === s.id} onConfirm={() => remove(s)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
