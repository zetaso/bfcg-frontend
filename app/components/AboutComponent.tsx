import { Link } from "react-router";
import Markdown from "react-markdown";
import SectionTitle from "./SectionTitle";
import { useSettings } from "../lib/settings";

export default function AboutComponent() {
  const t = useSettings();

  return (
    <section id="nosotros" className="bg-paper py-20 scroll-mt-20">
      <div className="mx-auto max-w-300 px-4 flex flex-col gap-16">
        <SectionTitle title={t("about.title")} />

        <div className="flex flex-col md:flex-row items-stretch gap-10">
          <div className="md:w-1/3 flex justify-center items-center">
            <div className="h-48 w-48 md:h-72 md:w-72 border-16 border-primary flex flex-col justify-center items-center text-primary">
              <span className="font-display text-7xl md:text-9xl font-bold leading-none">{t("about.years")}</span>
              <span className="font-display text-2xl md:text-4xl font-extrabold tracking-widest">{t("about.years_label")}</span>
            </div>
          </div>

          <div className="md:w-2/3 border-2 border-graphite p-8 md:p-10 flex flex-col items-start gap-8">
            <div className="flex flex-col gap-6 text-xl md:text-lg text-graphite font-semibold text-justify leading-relaxed [&_strong]:text-charcoal">
              <Markdown>{t("about.body")}</Markdown>
            </div>
            <Link
              to="/services"
              className="px-6 py-3 bg-graphite text-paper text-lg font-semibold
                hover:bg-primary hover:text-charcoal transition-colors duration-150"
            >
              {t("about.cta_label")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
