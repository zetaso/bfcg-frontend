import { useEffect, useRef, useState } from "react";
import { adminFetch, goToLogin, SESSION_TOUCH_EVENT, type Me, type SessionInfo } from "../../lib/api";
import { Button } from "./ui";

const WARN_BEFORE_MS = 2 * 60 * 1000;
// While she is typing or clicking, tell the server at most this often so real activity isn't "idle".
const KEEPALIVE_EVERY_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["keydown", "pointerdown", "input", "wheel"] as const;

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Mirrors the server's session limits so she gets a warning before being logged out.
 * The server is the authority: this only warns, keeps a working session alive, and redirects.
 */
export default function SessionWatcher({ initial }: { initial: SessionInfo }) {
  const [session, setSession] = useState(initial);
  const lastTouch = useRef(Date.now());
  const lastActivity = useRef(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const onTouch = () => (lastTouch.current = Date.now());
    const onActivity = () => (lastActivity.current = Date.now());
    window.addEventListener(SESSION_TOUCH_EVENT, onTouch);
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      window.removeEventListener(SESSION_TOUCH_EVENT, onTouch);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  const keepAlive = async () => {
    try {
      const me = await adminFetch<Me>("/me");
      setSession(me.session);
    } catch {
      /* adminFetch already redirects when the session is over */
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const activeSinceTouch = lastActivity.current > lastTouch.current;
      if (activeSinceTouch && t - lastTouch.current > KEEPALIVE_EVERY_MS) {
        lastTouch.current = t; // avoid firing twice while the request is in flight
        keepAlive();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const idleDeadline = lastTouch.current + session.idle_timeout_seconds * 1000;
  const absoluteDeadline = Date.parse(session.expires_at);
  const deadline = Math.min(idleDeadline, absoluteDeadline);
  const remaining = deadline - now;

  useEffect(() => {
    if (remaining <= 0) goToLogin(true);
  }, [remaining]);

  if (remaining > WARN_BEFORE_MS) return null;

  const isAbsolute = absoluteDeadline <= idleDeadline;

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed bottom-0 inset-x-0 z-50 bg-charcoal text-paper border-t-4 border-primary pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-300 mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex-1 min-w-60">
          {isAbsolute ? (
            <>
              Tu sesión alcanzó su duración máxima y se cerrará en <strong>{fmt(remaining)}</strong>. Guarda tus
              cambios.
            </>
          ) : (
            <>
              Tu sesión se cerrará por inactividad en <strong>{fmt(remaining)}</strong>.
            </>
          )}
        </p>
        {!isAbsolute && <Button onClick={keepAlive}>Seguir conectado</Button>}
      </div>
    </div>
  );
}
