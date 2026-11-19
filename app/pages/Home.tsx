import HeroComponent from "../components/HeroComponent";
import AboutComponent from "../components/AboutComponent";
import ServicesComponent from "../components/services/ServicesComponent";
import ContactComponent from "../components/ContactComponent";

export default function Home() {

  return (
    <main className="mx-auto">
      <HeroComponent/>
      <AboutComponent/>
      <ServicesComponent/>
      <ContactComponent/>
    </main>
  );
}