import { Outlet } from "react-router";
import type { Route } from "./+types/Main";
import Footer from "../components/FooterComponent";
import Navbar from "../components/NavbarComponent";
import { fetchSettings, SettingsProvider } from "../lib/settings";

// Load the editable site text once, before first render, so visitors never see stale copy flash.
export async function clientLoader() {
  return { settings: await fetchSettings() };
}

export default function MainLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SettingsProvider value={loaderData.settings}>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </SettingsProvider>
  );
}
