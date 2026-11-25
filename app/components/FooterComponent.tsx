import { Link } from "react-router";
import { useSettings } from "../lib/settings";

const LINKS = [
  { text: "Inicio", to: "/" },
  { text: "Nosotros", to: "/#nosotros" },
  { text: "Servicios", to: "/services" },
  { text: "Contáctanos", to: "/#contacto" },
];

export default function FooterComponent() {
  const t = useSettings();

  return (
    <footer className="w-full bg-primary text-charcoal">
      <div className="max-w-300 mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="font-bold hover:underline underline-offset-4">
              {l.text}
            </Link>
          ))}
        </nav>
        <p className="text-sm">
          © {new Date().getFullYear()} {t("footer.company_name")}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
