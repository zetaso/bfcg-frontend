import { useEffect, useState } from "react";
import { Link } from "react-router";
import SectionTitle from "../SectionTitle";
import { useSettings } from "../../lib/settings";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function ServicesComponent() {
  const t = useSettings();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/v1/services`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        if (active) {
          setServices(Array.isArray(json?.data) ? json.data : []);
        }
      } catch (err) {
        if (active) {
          setError("No se pudieron cargar los servicios.");
          setServices([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="servicios" className="bg-mist py-20 scroll-mt-20">
      <div className="max-w-300 mx-auto px-4 flex flex-col gap-14">
        <SectionTitle
          title={t("services.title")}
          subtitle={t("services.subtitle")}
        />

        {loading && <p className="text-center text-steel">Cargando servicios...</p>}

        {error && (
          <p className="border-l-4 border-danger bg-paper px-4 py-3 text-danger">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 border-t border-l border-line">
            {services.map((service) => (
              <div key={service.id} className="border-b border-r border-line">
                <article
                  className="group bg-paper flex flex-col border-t-4 border-transparent hover:border-primary transition-colors duration-150"
                >
                  {service.image_url && (
                    <Link
                        to={`/services/${service.slug}`}
                        className="w-full aspect-video relative overflow-hidden"
                      >
                      <img
                        src={service.image_url}
                        alt={service.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-video object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black opacity-0 group-hover:opacity-15 transition-opacity duration-150"
                      ></div>
                    </Link>
                  )}
                  <div className="flex-1 p-8 flex flex-col gap-4">
                    <h3 className="text-2xl font-semibold text-ink">{service.title}</h3>
                    <p className="flex-1 text-lg text-charcoal">{service.short_description}</p>
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-line">
                      <span className="font-display font-bold text-ink">{service.price_text}</span>
                      <Link
                        to={`/services/${service.slug}`}
                        className="px-5 py-2.5 bg-primary text-charcoal text-sm font-bold uppercase tracking-wide
                          hover:bg-primary-dark transition-colors duration-150"
                      >
                        {t("services.cta_label")}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
