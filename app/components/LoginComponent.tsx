export default function LoginComponent() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-mist px-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-100 bg-graphite border-t-8 border-primary p-10 flex flex-col gap-6"
      >
        <h2 className="text-3xl font-semibold text-paper text-center">Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo"
          className="h-12 px-3 bg-paper text-charcoal border-2 border-paper outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="h-12 px-3 bg-paper text-charcoal border-2 border-paper outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="h-12 bg-primary text-charcoal text-lg font-bold uppercase hover:bg-primary-dark transition-colors duration-150"
        >
          Iniciar
        </button>
        <a href="#" className="text-sm text-primary text-center hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </form>
    </div>
  );
}
