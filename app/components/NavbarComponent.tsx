import { useEffect, useState } from "react";
import { Link } from "react-router";

const MENU = [
  { text: "Inicio", to: "/#home" },
  { text: "Nosotros", to: "/#nosotros" },
  { text: "Servicios", to: "/#servicios" },
  { text: "Contacto", to: "/#contacto" },
];

export default function NavbarComponent() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 bg-paper border-b border-line transition-[height] duration-300 ease-out ${scrolled ? "h-20" : "h-30"}`}>
      <nav className="h-full max-w-300 mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="h-full flex items-center">
          <img
            className={`h-14 w-auto origin-center transition-transform duration-300 ease-out ${scrolled ? "scale-100" : "scale-150"}`}
            src="/assets/logo.png" alt="BFCG Consultoría e Ingeniería" />
        </Link>

        <button
          type="button"
          className="md:hidden h-12 w-12 flex items-center justify-center text-2xl text-charcoal border border-line hover:bg-charcoal hover:text-paper"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <div
          className={`${open ? "flex" : "hidden"} md:flex
            absolute md:static top-full inset-x-0
            flex-col md:flex-row md:h-full
            bg-paper border-b md:border-0 border-line`}
        >
          {MENU.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="md:h-full flex items-center justify-center px-8 py-4 md:py-0
                text-[17px] text-charcoal border-t md:border-t-0 border-line
                border-b-4 border-b-transparent
                hover:bg-charcoal hover:text-paper hover:border-b-primary
                transition-colors duration-150"
            >
              {item.text}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
