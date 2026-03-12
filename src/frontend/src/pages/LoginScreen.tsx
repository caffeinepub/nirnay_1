import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Eye, Lock, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Typewriter hook for app tagline
function useTypewriter(text: string, speed = 60) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

const FEATURES = [
  {
    icon: Zap,
    title: "Instant SOS Alert",
    desc: "One tap to alert all trusted contacts with live location",
  },
  {
    icon: Eye,
    title: "Legal Awareness",
    desc: "Know your rights in any situation — offline, always",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    desc: "No tracking. No data selling. Zero-knowledge security.",
  },
];

export default function LoginScreen() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const tagline = useTypewriter("PERSONAL SAFETY SYSTEM", 55);

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden"
      data-ocid="login.page"
    >
      {/* Animated cyber grid background */}
      <div
        className="absolute inset-0 cyber-grid opacity-50"
        aria-hidden="true"
      />

      {/* Scan line overlay */}
      <div
        className="absolute inset-0 scan-line-overlay pointer-events-none"
        aria-hidden="true"
      />

      {/* Radial vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, oklch(0.08 0.01 260) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Corner decorators */}
      <div
        className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor: "oklch(0.78 0.15 195 / 0.4)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 pointer-events-none"
        style={{ borderColor: "oklch(0.78 0.15 195 / 0.4)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 pointer-events-none"
        style={{ borderColor: "oklch(0.78 0.15 195 / 0.4)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor: "oklch(0.78 0.15 195 / 0.4)" }}
        aria-hidden="true"
      />

      {/* ── Top: Logo + Title ── */}
      <div className="flex flex-col items-center gap-4 mt-6 relative z-10">
        {/* Shield with rotating rings */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="relative flex items-center justify-center"
          style={{ width: 110, height: 110 }}
        >
          {/* Outer rotating dashed ring */}
          <div
            className="absolute inset-0 rounded-full rotate-slow"
            style={{
              border: "1.5px dashed oklch(0.78 0.15 195 / 0.35)",
            }}
          />
          {/* Middle counter-rotating ring */}
          <div
            className="absolute rounded-full rotate-reverse"
            style={{
              width: 82,
              height: 82,
              border: "1px solid oklch(0.78 0.15 195 / 0.2)",
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 64,
              height: 64,
              background:
                "radial-gradient(circle, oklch(0.78 0.15 195 / 0.15) 0%, transparent 70%)",
              boxShadow: "0 0 30px oklch(0.78 0.15 195 / 0.3)",
            }}
          />
          {/* Shield icon */}
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.16 0.018 260)",
              border: "1.5px solid oklch(0.78 0.15 195 / 0.5)",
              boxShadow:
                "0 0 20px oklch(0.78 0.15 195 / 0.25), inset 0 0 12px oklch(0.78 0.15 195 / 0.08)",
            }}
          >
            <Shield
              className="w-8 h-8"
              style={{ color: "oklch(0.78 0.15 195)" }}
            />
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-1"
        >
          <h1
            className="text-5xl font-bold font-display tracking-[0.2em] text-foreground neon-glow"
            style={{ color: "oklch(0.78 0.15 195)" }}
          >
            NIRNAY
          </h1>
          {/* Typewriter tagline */}
          <div className="flex items-center gap-1">
            <p
              className="text-[10px] tracking-[0.25em] uppercase"
              style={{ color: "oklch(0.55 0.012 260)" }}
            >
              {tagline}
            </p>
            <span
              className="w-0.5 h-3 inline-block animate-[typewriter-blink_1s_ease-in-out_infinite]"
              style={{ background: "oklch(0.78 0.15 195)" }}
            />
          </div>
        </motion.div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 px-4 py-1.5 rounded-full"
          style={{
            background: "oklch(0.14 0.014 260)",
            border: "1px solid oklch(0.78 0.15 195 / 0.2)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full hud-dot"
            style={{ background: "oklch(0.58 0.16 142)" }}
          />
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "oklch(0.58 0.16 142)" }}
          >
            SYSTEM ONLINE
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "oklch(0.26 0.014 260)" }}
          />
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "oklch(0.45 0.01 260)" }}
          >
            v2.0
          </span>
        </motion.div>
      </div>

      {/* ── Middle: Feature cards ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs flex flex-col gap-2.5 my-auto relative z-10"
      >
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className="holo-card flex items-center gap-3 rounded-lg px-4 py-3.5"
              style={{
                borderLeft: "2px solid oklch(0.78 0.15 195 / 0.6)",
                border: "1px solid oklch(0.26 0.014 260)",
                borderLeftWidth: "2px",
                borderLeftColor: "oklch(0.78 0.15 195 / 0.6)",
              }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: "oklch(0.78 0.15 195 / 0.08)",
                  border: "1px solid oklch(0.78 0.15 195 / 0.25)",
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "oklch(0.78 0.15 195)" }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {feat.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.5 0.012 260)" }}
                >
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Bottom: Login CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="w-full max-w-xs flex flex-col gap-3 relative z-10"
      >
        {isLoginError && loginError && (
          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.62 0.26 27)" }}
            data-ocid="login.error_state"
          >
            {loginError.message}
          </p>
        )}

        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full py-4 rounded-lg font-semibold text-sm tracking-widest uppercase relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isLoggingIn
              ? "oklch(0.16 0.018 260)"
              : "oklch(0.78 0.15 195 / 0.12)",
            border: "1.5px solid oklch(0.78 0.15 195 / 0.6)",
            color: "oklch(0.78 0.15 195)",
            boxShadow: isLoggingIn
              ? "none"
              : "0 0 20px oklch(0.78 0.15 195 / 0.2), inset 0 0 20px oklch(0.78 0.15 195 / 0.05)",
          }}
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "oklch(0.78 0.15 195 / 0.6)" }}
              />
              AUTHENTICATING…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              SECURE LOGIN
            </span>
          )}
        </button>

        <p
          className="text-[10px] text-center leading-relaxed px-2 tracking-wide"
          style={{ color: "oklch(0.42 0.01 260)" }}
        >
          Secured by Internet Identity · No passwords · No data tracking
        </p>

        <p
          className="text-[10px] text-center"
          style={{ color: "oklch(0.35 0.01 260)" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
