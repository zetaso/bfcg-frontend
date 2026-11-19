import { useEffect, useState } from "react";
import { Link } from "react-router";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function ServicesComponent() {
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

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-slate-600">Cargando servicios...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-slate-900 mb-3">Servicios Profesionales</h2>
      <p className="text-lg text-slate-600 mb-8">Asesoría especializada adaptada a tus necesidades.</p>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="border border-slate-200 rounded-xl p-6 shadow-sm bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-600 mb-4">{service.short_description}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <span className="font-bold text-emerald-600">{service.price_text}</span>
              <Link
                to={`/services/${service.slug}`}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Ver detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}