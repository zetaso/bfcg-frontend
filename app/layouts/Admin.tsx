import { NavLink, Outlet, redirect } from "react-router";
import type { Route } from "./+types/Admin";
import { currentSession, logout, LOGIN_PATH } from "../lib/api";
import SessionWatcher from "../components/admin/SessionWatcher";

// Guard: every /admin page needs a live admin session.
export async function clientLoader() {
  const me = await currentSession();
  if (!me) throw redirect(LOGIN_PATH);
  return { email: me.user.email, session: me.session };
}

const TABS = [
  { to: "/admin", label: "Textos del sitio", end: true },
  { to: "/admin/services", label: "Servicios", end: false },
  { to: "/admin/testimonials", label: "Testimonios", end: false },
];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <header className="bg-charcoal text-paper border-b-4 border-primary">
        <div className="max-w-300 mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <span className="font-display text-lg font-bold">
            BFCG <span className="text-primary">Admin</span>
          </span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-paper/70">{loaderData.email}</span>
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-primary">
              Ver sitio
            </a>
            <button type="button" onClick={logout} className="hover:text-primary hover:cursor-pointer">
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="max-w-300 mx-auto px-4 flex">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors duration-150
                ${isActive ? "bg-mist text-charcoal" : "text-paper/80 hover:bg-graphite hover:text-paper"}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-300 w-full mx-auto px-4 py-10">
        <Outlet />
      </main>

      <SessionWatcher initial={loaderData.session} />
    </div>
  );
}
