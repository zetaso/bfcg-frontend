import { useEffect, useState } from "react";
import SectionTitle from "./SectionTitle";
import { useSettings } from "../lib/settings";
import { API_URL } from "../lib/api";

type Testimonial = {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
};

/** Featured testimonials (the API only returns those). Renders nothing when there are none. */
export default function TestimonialsComponent() {
  const t = useSettings();
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/v1/testimonials`)
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => active && setItems(Array.isArray(json) ? json : json?.data ?? []))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  const subtitle = t("testimonials.subtitle").trim();

  return (
    <section id="testimonios" className="bg-paper py-20 scroll-mt-20">
      <div className="max-w-300 mx-auto px-4 flex flex-col gap-14">
        <SectionTitle title={t("testimonials.title")} subtitle={subtitle || undefined} />

        <div className="grid gap-px bg-line border border-line md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="bg-paper p-8 flex flex-col gap-6">
              <span aria-hidden className="h-12 w-12 bg-primary flex items-center justify-center font-display text-4xl font-bold text-charcoal leading-none pt-3">
                “
              </span>
              <blockquote className="flex-1 text-lg text-charcoal leading-relaxed whitespace-pre-line">
                {item.quote}
              </blockquote>
              <figcaption className="border-l-4 border-primary pl-4">
                <span className="block font-display font-semibold text-ink">{item.client_name}</span>
                {item.client_role && <span className="block text-sm text-steel">{item.client_role}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
