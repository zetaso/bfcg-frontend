import { useEffect, useState } from "react";
import { Link } from "react-router";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Highlight = {
  id: string;
  item_type?: string;
  title?: string | null;
  content: string;
};

const TYPE_LABELS: Record<string, string> = {
  benefit: "Beneficios",
  step: "Proceso",
  faq: "Preguntas frecuentes",
};

export default function ServiceDetailComponent({ slug }: { slug: string }) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    let active = true;

    async function loadService() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/v1/services/${slug}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        if (active) {
          setService(json?.data ?? null);
        }
      } catch (err) {
        if (active) {
          setError("No se pudo cargar el servicio.");
          setService(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadService();
    return () => {
      active = false;
    };
  }, [slug]);

  const highlights: Highlight[] = Array.isArray(service?.highlights) ? service.highlights : [];
  const groups = Object.entries(
    highlights.reduce<Record<string, Highlight[]>>((acc, h) => {
      const key = h.item_type ?? "benefit";
      (acc[key] ??= []).push(h);
      return acc;
    }, {}),
  );

  return (
    <section className="bg-mist pt-20 min-h-screen">
      <div className="bg-ink">
        <div className="max-w-300 mx-auto px-4 py-14 flex flex-col gap-4">
          <Link to="/services" className="self-start text-sm text-paper/70 hover:text-primary uppercase tracking-wide">
            ← Servicios
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-paper">
            {service?.title ?? "Detalles del Servicio"}
          </h1>
          <span className="h-1 w-20 bg-primary" />
        </div>
      </div>

      <div className="max-w-300 mx-auto px-4 py-14">
        {loading && <p className="text-steel">Cargando servicio...</p>}

        {error && <p className="border-l-4 border-danger bg-paper px-4 py-3 text-danger">{error}</p>}

        {!loading && !error && !service && (
          <p className="text-ink text-xl font-semibold">Servicio no encontrado</p>
        )}

        {service && (
          <div className="grid gap-10 md:grid-cols-3">
            <div className="md:col-span-2 bg-paper border border-line">
              {service.image_url && (
                <img src={service.image_url} alt={service.title} className="w-full aspect-video object-cover" />
              )}
              <div className="p-8 md:p-10 flex flex-col gap-8">
                
                <p className="text-lg md:text-xl text-charcoal leading-relaxed whitespace-pre-line">
                  {service.full_description ?? service.short_description}
                </p>

                {groups.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-line pt-8">
                    {groups.map(([type, items], index) => {
                      const isOpen = openIndex === index;
                      return (
                        <div key={type} className="border border-line">
                          <button
                            type="button"
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            aria-expanded={isOpen}
                            className={`w-full flex justify-between items-center px-5 py-4 text-left font-display text-lg font-semibold
                              transition-colors duration-150
                              ${isOpen ? "bg-primary text-charcoal" : "bg-paper text-ink hover:bg-primary-soft"}`}
                          >
                            {TYPE_LABELS[type] ?? type}
                            <span className="text-sm">{isOpen ? "▲" : "▼"}</span>
                          </button>
                          {isOpen && (
                            <div className="bg-primary-soft border-t border-line px-6 py-6 flex flex-col gap-5">
                              {items.map((h) => (
                                <div key={h.id} className="border-l-4 border-primary pl-4">
                                  {h.title && <h3 className="font-semibold text-ink mb-1">{h.title}</h3>}
                                  <p className="text-charcoal">{h.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="self-start bg-graphite text-paper p-8 flex flex-col gap-5 border-t-8 border-primary">
              {service.price_text && (
                <div>
                  <span className="block text-xs uppercase tracking-widest text-paper/60">Valor</span>
                  <span className="font-display text-2xl font-bold">{service.price_text}</span>
                </div>
              )}
              {service.duration_text && (
                <div>
                  <span className="block text-xs uppercase tracking-widest text-paper/60">Duración</span>
                  <span className="font-display text-xl font-semibold">{service.duration_text}</span>
                </div>
              )}
              <Link
                to="/#contacto"
                className="text-center px-6 py-3 bg-primary text-charcoal font-bold uppercase tracking-wide
                  hover:bg-primary-dark transition-colors duration-150"
              >
                Solicitar asesoría
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
