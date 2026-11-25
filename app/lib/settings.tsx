import { createContext, useContext, type ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/**
 * Fallback copy, used only when a key is missing from site_settings or the API is unreachable.
 * The database is the source of truth; keep these in sync with the seed migration.
 */
export const DEFAULT_SETTINGS = {
  "hero.title": "Asesórate con expertos",
  "hero.subtitle":
    "Con experiencia trazamos el camino, con visión proyectamos el futuro y con estrategia impulsamos el éxito de tu empresa.",
  "hero.cta_label": "Contáctanos",
  "hero.standards_label": "Aplicamos estándares",

  "about.title": "¿Quienes somos?",
  "about.years": "16",
  "about.years_label": "AÑOS",
  "about.body":
    "Somos una empresa de consultoría y capacitación con más de **16 años de experiencia**, brindamos asesorías, consultorías y capacitaciones personalizadas, diseñadas a medida de las necesidades de cada organización.\n\nNos involucramos directamente con los colaboradores, gestionando las acciones necesarias para promover la mejora continua y fortalecer la estructura organizacional.",
  "about.cta_label": "Conoce nuestros servicios",

  "services.title": "Nuestros Servicios",
  "services.subtitle": "Asesoría especializada adaptada a las necesidades de tu organización.",
  "services.cta_label": "Ver más",

  "contact.title": "Contáctanos",
  "contact.form_title": "Escríbenos",
  "contact.submit_label": "Enviar",
  "contact.channels_title": "Canales",
  "contact.email": "contacto@bfcg.cl",
  "contact.whatsapp_url": "https://wa.me/56944123994",
  "contact.linkedin_url": "https://www.linkedin.com/company/bfcg-consultoria-e-ingenieria-spa",
  "contact.instagram_url": "https://www.instagram.com/bfcgasesoria/",

  "footer.company_name": "BFCG Consultoría e Ingeniería SPA",
  "footer.rights": "Todos los derechos reservados.",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type Settings = Record<string, string>;

/** Fetches site_settings as a key → value map. Never throws: falls back to defaults. */
export async function fetchSettings(): Promise<Settings> {
  try {
    const res = await fetch(`${API_URL}/api/v1/sitesettings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows: { key: string; value: string | null }[] = Array.isArray(json) ? json : json?.data ?? [];
    return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  } catch (err) {
    console.error("No se pudieron cargar los textos del sitio:", err);
    return {};
  }
}

const SettingsContext = createContext<Settings>({});

export function SettingsProvider({ value, children }: { value: Settings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Returns a getter for site text. A key stored in the DB wins even when empty
 * (so clearing a value can hide something); missing keys use DEFAULT_SETTINGS.
 */
export function useSettings() {
  const settings = useContext(SettingsContext);
  return (key: SettingKey): string => settings[key] ?? DEFAULT_SETTINGS[key];
}
