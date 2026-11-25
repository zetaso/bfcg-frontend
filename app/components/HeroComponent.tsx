import { Link } from "react-router";
import { useSettings } from "../lib/settings";

const LOGOS = [
  { src: "/assets/white_logos/collahuasi.png", alt: "Collahuasi" },
  { src: "/assets/white_logos/sqm.png", alt: "SQM" },
  { src: "/assets/white_logos/mantos_copper.png", alt: "Mantos Copper" },
  { src: "/assets/white_logos/sierra_gorda.png", alt: "Sierra Gorda" },
  { src: "/assets/white_logos/HMC.png", alt: "HMC" },
  { src: "/assets/white_logos/quebrada_blanca.png", alt: "Quebrada Blanca" },
];

export default function HeroComponent() {
  const t = useSettings();

  return (
    <section id="home" className="relative min-h-screen pt-30 flex flex-col bg-charcoal overflow-hidden">
      <img
        src="/assets/oficina-personas.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[30%_50%]"
      />
      {/* Flat tint instead of a gradient */}
      <div className="absolute inset-0 bg-charcoal/60" />

      <div className="relative flex-1 max-w-300 w-full mx-auto px-4 flex flex-col justify-between gap-16 py-16">
        <div className="flex-1 flex flex-col justify-center items-start gap-8 md:w-3/5 text-paper">
          <span className="h-1 w-20 bg-primary" />
          <h1 className="text-4xl md:text-5xl font-bold uppercase leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-175 whitespace-pre-line">
            {t("hero.subtitle")}
          </p>
          <Link
            to="/#contacto"
            className="mt-2 px-8 py-4 bg-primary text-charcoal text-lg font-bold uppercase tracking-wide
              hover:bg-primary-dark transition-colors duration-150"
          >
            {t("hero.cta_label")}
          </Link>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-paper/30 pt-8">
          <span className="text-paper text-lg font-semibold uppercase tracking-widest">
            {t("hero.standards_label")}
          </span>
          <div className="w-full flex flex-wrap justify-center md:justify-between items-center gap-6">
            {LOGOS.map((logo) => (
              <img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                className="h-16 md:h-24 w-auto transition-transform duration-100 hover:scale-110"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
