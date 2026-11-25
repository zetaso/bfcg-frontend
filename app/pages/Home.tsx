import HeroComponent from "../components/HeroComponent";
import AboutComponent from "../components/AboutComponent";
import ServicesComponent from "../components/services/ServicesComponent";
import TestimonialsComponent from "../components/TestimonialsComponent";
import ContactComponent from "../components/ContactComponent";

export default function Home() {

  return (
    <div>
      <HeroComponent/>
      <AboutComponent/>
      <ServicesComponent/>
      <TestimonialsComponent/>
      <ContactComponent/>
    </div>
  );
}