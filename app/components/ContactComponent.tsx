import { useState, type FormEvent } from "react";
import SectionTitle from "./SectionTitle";
import { useSettings } from "../lib/settings";

type Field = "nombre" | "apellido" | "email" | "telefono" | "mensaje";

const FIELDS: { name: Field; label: string; type: string }[] = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "apellido", label: "Apellido", type: "text" },
  { name: "email", label: "Correo electrónico", type: "email" },
  { name: "telefono", label: "Número de teléfono", type: "tel" },
];

const EMPTY: Record<Field, string> = { nombre: "", apellido: "", email: "", telefono: "", mensaje: "" };

const inputClass = (hasError: boolean) =>
  `w-full h-12 px-3 bg-paper text-charcoal placeholder:text-steel border-2 outline-none
   focus:border-primary ${hasError ? "border-danger" : "border-paper"}`;

export default function ContactComponent() {
  const t = useSettings();
  const [values, setValues] = useState(EMPTY);

  // A channel whose value is cleared in site_settings is hidden.
  const email = t("contact.email").trim();
  const channels = [
    { label: "LinkedIn", href: t("contact.linkedin_url").trim() },
    { label: "WhatsApp", href: t("contact.whatsapp_url").trim() },
    { label: email, href: email && `mailto:${email}` },
    { label: "Instagram", href: t("contact.instagram_url").trim() },
  ].filter((c) => c.href);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});

  const update = (name: Field, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: false }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const missing = Object.fromEntries(
      (Object.keys(values) as Field[]).map((k) => [k, !values[k].trim()]),
    );
    setErrors(missing);
    if (Object.values(missing).some(Boolean)) return;
    // TODO: hook up to the contact endpoint
  };

  return (
    <section id="contacto" className="bg-mist py-20 scroll-mt-20">
      <div className="mx-auto max-w-300 px-4 flex flex-col gap-14">
        <SectionTitle title={t("contact.title")} />

        <div className="flex flex-col md:flex-row gap-0 border-2 border-ink">
          <form onSubmit={onSubmit} noValidate className="md:w-2/3 bg-graphite p-8 md:p-10 flex flex-col gap-5">
            <h3 className="text-2xl font-semibold text-paper">{t("contact.form_title")}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <input
                  key={f.name}
                  type={f.type}
                  value={values[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                  placeholder={errors[f.name] ? `${f.label} es obligatorio` : f.label}
                  aria-invalid={errors[f.name] || undefined}
                  className={inputClass(!!errors[f.name])}
                />
              ))}
            </div>
            <textarea
              value={values.mensaje}
              onChange={(e) => update("mensaje", e.target.value)}
              placeholder={errors.mensaje ? "El mensaje es obligatorio" : "Mensaje"}
              aria-invalid={errors.mensaje || undefined}
              className={`${inputClass(!!errors.mensaje)} h-40 py-3 resize-none`}
            />
            <button
              type="submit"
              className="self-start px-8 py-3 bg-primary text-charcoal font-bold uppercase tracking-wide
                hover:bg-primary-dark transition-colors duration-150"
            >
              {t("contact.submit_label")}
            </button>
          </form>

          <div className="md:w-1/3 bg-ink p-8 md:p-10 flex flex-col gap-6">
            <h3 className="text-2xl font-semibold text-paper">{t("contact.channels_title")}</h3>
            <ul className="flex flex-col">
              {channels.map((c) => (
                <li key={c.href} className="border-b border-paper/20">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-4 text-lg text-paper border-l-4 border-transparent
                      hover:border-primary hover:pl-3 hover:text-primary transition-all duration-150"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
