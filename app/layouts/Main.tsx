import { Outlet } from "react-router";
import Footer from "../components/FooterComponent";
import Navbar from "../components/NavbarComponent";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}