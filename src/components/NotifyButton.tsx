"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

type Prefs = { services: boolean; events: boolean; news: boolean };
type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const LABELS: { key: keyof Prefs; label: string }[] = [
  { key: "services", label: "Cultes et réunions" },
  { key: "events", label: "Événements" },
  { key: "news", label: "Annonces importantes" },
];

/**
 * Active les rappels sur cet appareil (notifications du navigateur) :
 * la veille et 1 h avant chaque culte ou événement.
 */
export function NotifyButton({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ services: true, events: true, news: true });
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      let next: Status;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !KEY) {
        next = ios && !standalone ? "ios-install" : "unsupported";
      } else if (Notification.permission === "denied") {
        next = "denied";
      } else {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (sub && !cancelled) setEndpoint(sub.endpoint);
        next = sub ? "on" : "off";
      }
      if (!cancelled) setStatus(next);
    })().catch(() => !cancelled && setStatus("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    try {
      if ((await Notification.requestPermission()) !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(KEY!) });
      const res = await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON() }) });
      const data = await res.json();
      if (data.prefs) setPrefs(data.prefs);
      setEndpoint(sub.endpoint);
      setStatus("on");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setEndpoint(null);
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (endpoint) await fetch("/api/push", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint, prefs: { [key]: next[key] } }) });
  }

  const muted = dark ? "text-white/70" : "text-night-800/70";

  if (status === "loading") return <div className="h-12" />;
  if (status === "unsupported") return <p className={`text-sm ${muted}`}>Les notifications ne sont pas disponibles sur ce navigateur. Utilisez plutôt l&apos;abonnement à l&apos;agenda.</p>;
  if (status === "ios-install")
    return (
      <p className={`text-sm ${muted}`}>
        Sur iPhone : touchez <strong>Partager</strong> puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>, ouvrez l&apos;application installée, puis activez les rappels.
      </p>
    );
  if (status === "denied")
    return <p className={`flex items-center gap-2 text-sm ${muted}`}><BellOff className="size-4" /> Notifications bloquées. Autorisez-les dans les réglages du navigateur pour ce site.</p>;

  return (
    <div>
      {status === "off" ? (
        <motion.button
          onClick={enable}
          disabled={busy}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 px-6 py-3 text-sm font-bold text-night-950 shadow-[0_10px_30px_-10px_rgba(212,164,60,.8)] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <motion.span animate={{ rotate: [0, -18, 14, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}><Bell className="size-4" /></motion.span>}
          Activer les rappels sur ce téléphone
        </motion.button>
      ) : (
        <div className={`rounded-2xl border p-4 ${dark ? "border-white/15 bg-white/5" : "border-gold-500/30 bg-white"}`}>
          <p className={`flex items-center gap-2 font-semibold ${dark ? "text-white" : "text-night-900"}`}>
            <BellRing className="size-5 text-gold-500" /> Rappels activés sur cet appareil
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                aria-pressed={prefs[key]}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${prefs[key] ? "bg-gold-400 text-night-950" : dark ? "bg-white/10 text-white/60" : "bg-night-900/5 text-night-800/50"}`}
              >
                {label}
              </button>
            ))}
          </div>
            <button onClick={disable} disabled={busy} className={`mt-3 text-xs underline ${muted}`}>
              Désactiver les rappels
            </button>
        </div>
      )}
    </div>
  );
}
