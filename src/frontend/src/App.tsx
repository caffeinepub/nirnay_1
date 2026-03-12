import BottomNav, { type Tab } from "@/components/BottomNav";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import ContactsScreen from "@/pages/ContactsScreen";
import EvidenceScreen from "@/pages/EvidenceScreen";
import LegalScreen from "@/pages/LegalScreen";
import LoginScreen from "@/pages/LoginScreen";
import SOSScreen from "@/pages/SOSScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("sos");
  const { identity, isInitializing } = useInternetIdentity();

  // Initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.56 0.24 27 / 0.15)",
            border: "2px solid oklch(0.56 0.24 27 / 0.3)",
          }}
        >
          <div
            className="w-8 h-8 border-2 border-transparent rounded-full animate-spin"
            style={{ borderTopColor: "oklch(0.62 0.26 27)" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">Loading Nirnay…</p>
      </div>
    );
  }

  // Not authenticated
  if (!identity) {
    return (
      <>
        <LoginScreen />
        <SonnerToaster position="top-center" theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Mobile wrapper */}
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: 430, minHeight: "100vh" }}
      >
        {/* Screen Content */}
        <main
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ paddingBottom: "80px" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="flex flex-col flex-1"
            >
              {activeTab === "sos" && <SOSScreen />}
              {activeTab === "contacts" && <ContactsScreen />}
              {activeTab === "evidence" && <EvidenceScreen />}
              {activeTab === "legal" && <LegalScreen />}
              {activeTab === "settings" && <SettingsScreen />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer / attribution */}
        {activeTab !== "sos" && (
          <div
            className="text-center py-1.5 border-t border-border/50"
            style={{ paddingBottom: 4 }}
          >
            <p className="text-[10px] text-muted-foreground">
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Built with love using caffeine.ai
              </a>
            </p>
          </div>
        )}

        {/* Bottom Navigation */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full"
          style={{ maxWidth: 430 }}
        >
          <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <SonnerToaster position="top-center" theme="dark" richColors />
    </div>
  );
}
