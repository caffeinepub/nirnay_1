import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelSOS, useSOSState, useTriggerSOS } from "@/hooks/useQueries";
import { AlertTriangle, PhoneOff, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const COUNTDOWN_SECONDS = 3;

export default function SOSScreen() {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [sosActiveTime, setSosActiveTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const countdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: isSosActive, isLoading: sosLoading } = useSOSState();
  const triggerSOS = useTriggerSOS();
  const cancelSOS = useCancelSOS();

  useEffect(() => {
    if (isSosActive && !sosActiveTime) {
      setSosActiveTime(new Date());
    } else if (!isSosActive) {
      setSosActiveTime(null);
      setElapsed("00:00");
    }
  }, [isSosActive, sosActiveTime]);

  useEffect(() => {
    if (sosActiveTime) {
      elapsedTimer.current = setInterval(() => {
        const diff = Math.floor((Date.now() - sosActiveTime.getTime()) / 1000);
        const m = String(Math.floor(diff / 60)).padStart(2, "0");
        const s = String(diff % 60).padStart(2, "0");
        setElapsed(`${m}:${s}`);
      }, 1000);
    } else {
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    }
    return () => {
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    };
  }, [sosActiveTime]);

  const handleSOSPress = useCallback(() => {
    if (isSosActive || isCountingDown) return;
    setIsCountingDown(true);
    setCountdown(COUNTDOWN_SECONDS);
  }, [isSosActive, isCountingDown]);

  const handleCancelCountdown = useCallback(() => {
    setIsCountingDown(false);
    setCountdown(COUNTDOWN_SECONDS);
    if (countdownTimer.current) clearTimeout(countdownTimer.current);
    toast.info("SOS cancelled");
  }, []);

  useEffect(() => {
    if (!isCountingDown) return;
    if (countdown <= 0) {
      setIsCountingDown(false);
      setCountdown(COUNTDOWN_SECONDS);
      triggerSOS.mutate(undefined, {
        onSuccess: () => {
          toast.success("SOS alert sent to your emergency contacts", {
            icon: "🚨",
          });
          setSosActiveTime(new Date());
        },
        onError: () => {
          toast.error("Failed to trigger SOS. Please try again.");
        },
      });
      return;
    }
    countdownTimer.current = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
    };
  }, [isCountingDown, countdown, triggerSOS]);

  const handleCancelSOS = useCallback(() => {
    cancelSOS.mutate(undefined, {
      onSuccess: () => {
        toast.success("SOS alert cancelled");
        setSosActiveTime(null);
      },
      onError: () => {
        toast.error("Failed to cancel SOS");
      },
    });
  }, [cancelSOS]);

  const circumference = 2 * Math.PI * 45;
  const strokeProgress = isCountingDown
    ? circumference * (1 - (COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS)
    : 0;

  if (sosLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 gap-8 px-6"
        data-ocid="sos.loading_state"
      >
        <Skeleton className="w-52 h-52 rounded-full" />
        <Skeleton className="h-5 w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between flex-1 px-6 py-6 relative overflow-hidden">
      {/* Cyber grid background */}
      <div
        className="absolute inset-0 cyber-grid opacity-30"
        aria-hidden="true"
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, oklch(0.1 0.01 260 / 0.9) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Active SOS Banner */}
      <AnimatePresence>
        {isSosActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flash-banner w-full relative z-10 rounded-lg px-4 py-3 flex items-center justify-between"
            style={{
              background: "oklch(0.52 0.22 27 / 0.2)",
              border: "1px solid oklch(0.56 0.24 27 / 0.6)",
              boxShadow: "0 0 20px oklch(0.56 0.24 27 / 0.2)",
            }}
            data-ocid="sos.success_state"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="w-5 h-5 animate-bounce"
                style={{ color: "oklch(0.62 0.26 27)" }}
              />
              <div>
                <p
                  className="text-sm font-bold tracking-widest"
                  style={{ color: "oklch(0.92 0.006 260)" }}
                >
                  SOS ACTIVE
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.01 260)" }}
                >
                  Elapsed: {elapsed}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSOS}
              disabled={cancelSOS.isPending}
              className="text-xs"
              style={{
                borderColor: "oklch(0.56 0.24 27 / 0.5)",
                color: "oklch(0.62 0.26 27)",
              }}
              data-ocid="sos.cancel_button"
            >
              {cancelSOS.isPending ? "Cancelling…" : "Cancel SOS"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD top bar */}
      <div className="w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full hud-dot"
            style={{ background: "oklch(0.78 0.15 195)" }}
          />
          <span
            className="text-[10px] tracking-widest uppercase font-semibold"
            style={{ color: "oklch(0.78 0.15 195)" }}
          >
            SECURE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Shield
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.45 0.01 260)" }}
          />
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "oklch(0.45 0.01 260)" }}
          >
            NIRNAY
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] tracking-widest uppercase font-semibold"
            style={{ color: "oklch(0.58 0.16 142)" }}
          >
            PRIVATE
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full hud-dot"
            style={{
              background: "oklch(0.58 0.16 142)",
              animationDelay: "0.5s",
            }}
          />
        </div>
      </div>

      {/* ── SOS Button Section ── */}
      <div className="flex flex-col items-center gap-8 my-auto relative z-10">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 280, height: 280 }}
        >
          {/* Concentric pulse rings — only when idle */}
          {!isCountingDown && !isSosActive && (
            <>
              <div
                className="absolute rounded-full ring-pulse-1"
                style={{
                  width: 200,
                  height: 200,
                  border: "1.5px solid oklch(0.56 0.24 27 / 0.5)",
                }}
              />
              <div
                className="absolute rounded-full ring-pulse-2"
                style={{
                  width: 200,
                  height: 200,
                  border: "1.5px solid oklch(0.56 0.24 27 / 0.35)",
                }}
              />
              <div
                className="absolute rounded-full ring-pulse-3"
                style={{
                  width: 200,
                  height: 200,
                  border: "1px solid oklch(0.56 0.24 27 / 0.2)",
                }}
              />
            </>
          )}

          {/* Radar sweep ring when active */}
          {isSosActive && (
            <div
              className="absolute rounded-full"
              style={{
                width: 240,
                height: 240,
                border: "1px solid oklch(0.56 0.24 27 / 0.3)",
                background:
                  "conic-gradient(from 0deg, oklch(0.56 0.24 27 / 0.2) 0deg, transparent 60deg, transparent 360deg)",
                animation: "radar-sweep 2s linear infinite",
              }}
            />
          )}

          {/* Countdown SVG ring */}
          <AnimatePresence>
            {isCountingDown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 100 100"
                  className="absolute"
                  style={{ transform: "rotate(-90deg)" }}
                  role="img"
                  aria-label="SOS countdown progress"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="oklch(0.56 0.24 27 / 0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="oklch(0.62 0.26 27)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeProgress}
                    style={{
                      transition: "stroke-dashoffset 1s linear",
                      filter: "drop-shadow(0 0 6px oklch(0.56 0.24 27 / 0.8))",
                    }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main SOS button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSOSPress}
            disabled={isSosActive || isCountingDown}
            aria-label="Trigger SOS emergency alert"
            className={`
              relative w-48 h-48 rounded-full
              flex flex-col items-center justify-center
              font-bold select-none cursor-pointer
              transition-all duration-300 disabled:cursor-not-allowed
              ${
                isSosActive
                  ? "sos-btn-active"
                  : isCountingDown
                    ? ""
                    : "sos-btn-idle"
              }
            `}
            style={{
              background: isSosActive
                ? "radial-gradient(circle, oklch(0.45 0.22 27) 0%, oklch(0.32 0.18 27) 100%)"
                : isCountingDown
                  ? "radial-gradient(circle, oklch(0.4 0.2 27) 0%, oklch(0.28 0.16 27) 100%)"
                  : "radial-gradient(circle, oklch(0.52 0.24 27) 0%, oklch(0.38 0.2 27) 100%)",
              border: "2px solid oklch(0.56 0.24 27 / 0.8)",
              boxShadow: isSosActive
                ? "0 0 60px oklch(0.56 0.24 27 / 0.6), 0 0 120px oklch(0.56 0.24 27 / 0.3), inset 0 0 30px oklch(0.56 0.24 27 / 0.15)"
                : "0 0 40px oklch(0.56 0.24 27 / 0.4), inset 0 0 20px oklch(0.56 0.24 27 / 0.1)",
              color: "oklch(0.97 0 0)",
            }}
            data-ocid="sos.primary_button"
          >
            <AnimatePresence mode="wait">
              {isCountingDown ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-7xl font-bold leading-none">
                    {countdown}
                  </span>
                  <span className="text-xs tracking-widest uppercase opacity-80">
                    SENDING…
                  </span>
                </motion.div>
              ) : isSosActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <AlertTriangle className="w-10 h-10" />
                  <span className="text-sm font-bold tracking-widest">
                    SOS ACTIVE
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-5xl font-bold tracking-tight">SOS</span>
                  <span className="text-xs tracking-[0.3em] uppercase opacity-80">
                    TAP TO ALERT
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Cancel countdown */}
        <AnimatePresence>
          {isCountingDown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancelCountdown}
                className="gap-2 font-semibold tracking-widest uppercase text-xs"
                style={{
                  borderColor: "oklch(0.56 0.24 27 / 0.5)",
                  color: "oklch(0.62 0.26 27)",
                }}
                data-ocid="sos.cancel_button"
              >
                <X className="w-4 h-4" />
                CANCEL ({countdown}s)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel active SOS */}
        <AnimatePresence>
          {isSosActive && !isCountingDown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancelSOS}
                disabled={cancelSOS.isPending}
                className="gap-2 font-semibold tracking-widest uppercase text-xs"
                style={{
                  borderColor: "oklch(0.56 0.24 27 / 0.5)",
                  color: "oklch(0.62 0.26 27)",
                }}
                data-ocid="sos.cancel_button"
              >
                <PhoneOff className="w-4 h-4" />
                {cancelSOS.isPending ? "CANCELLING…" : "CANCEL SOS ALERT"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom instruction */}
      <div className="text-center px-4 pb-2 relative z-10">
        {!isSosActive && !isCountingDown && (
          <p
            className="text-xs leading-relaxed max-w-xs mx-auto tracking-wide"
            style={{ color: "oklch(0.45 0.01 260)" }}
          >
            Hold to start 3-second countdown · Alerts all emergency contacts ·
            Shares location
          </p>
        )}
        {isSosActive && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex items-center gap-2"
              style={{ color: "oklch(0.62 0.26 27)" }}
            >
              <span
                className="w-2 h-2 rounded-full hud-dot"
                style={{ background: "oklch(0.62 0.26 27)" }}
              />
              <p className="text-xs tracking-widest uppercase">
                CONTACTS NOTIFIED
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
