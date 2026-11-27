import { useState, type FormEvent } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { currentSession, login } from "../../lib/api";
import { inputClass } from "../../components/admin/ui";

export async function clientLoader() {
  if (await currentSession()) throw redirect("/admin");
  return null;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get("expired") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      {/* <img
        src="/assets/personas-conversando.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      /> */}
      <form
        onSubmit={onSubmit}
        className="w-full max-w-100 bg-paper border-t-8 border-primary p-10 flex flex-col gap-5"
      >
        <img src="/assets/logo.png" alt="BFCG" className="self-center bg-paper p-2" />
        <h1 className="text-2xl font-semibold text-charcoal text-center">Panel de administración</h1>

        <input
          type="email"
          autoComplete="username"
          required
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          autoComplete="current-password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        {expired && !error && (
          <p className="border-l-4 border-primary bg-primary-soft px-3 py-2 text-sm text-charcoal">
            Tu sesión expiró. Vuelve a iniciar sesión.
          </p>
        )}
        {error && <p className="border-l-4 border-danger bg-paper px-3 py-2 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-12 bg-primary text-charcoal text-lg font-bold uppercase hover:bg-primary-dark
            transition-colors duration-150 disabled:opacity-60"
        >
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
