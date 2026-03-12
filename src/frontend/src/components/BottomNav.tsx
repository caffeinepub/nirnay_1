import { FolderOpen, Scale, Settings, Shield, Users } from "lucide-react";
import { motion } from "motion/react";

export type Tab = "sos" | "contacts" | "evidence" | "legal" | "settings";

const NAV_ITEMS: {
  id: Tab;
  icon: React.ElementType;
  label: string;
  ocid: string;
}[] = [
  { id: "sos", icon: Shield, label: "SOS", ocid: "nav.sos.link" },
  { id: "contacts", icon: Users, label: "Contacts", ocid: "nav.contacts.link" },
  {
    id: "evidence",
    icon: FolderOpen,
    label: "Evidence",
    ocid: "nav.evidence.link",
  },
  { id: "legal", icon: Scale, label: "Legal", ocid: "nav.legal.link" },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    ocid: "nav.settings.link",
  },
];

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="bottom-nav flex items-stretch w-full safe-bottom"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ id, icon: Icon, label, ocid }) => {
        const isActive = activeTab === id;
        const isSOS = id === "sos";
        const activeColor = isSOS
          ? "oklch(0.62 0.26 27)"
          : "oklch(0.78 0.15 195)";

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px]
              transition-all duration-200 relative
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            `}
            style={{
              color: isActive ? activeColor : "oklch(0.45 0.01 260)",
            }}
            data-ocid={ocid}
          >
            {/* Neon active underline indicator */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{
                  width: 28,
                  background: activeColor,
                  boxShadow: `0 0 8px ${activeColor}, 0 0 16px ${activeColor}`,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}

            {/* Icon container */}
            <div
              className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200"
              style={
                isActive
                  ? {
                      background: isSOS
                        ? "oklch(0.56 0.24 27 / 0.15)"
                        : "oklch(0.78 0.15 195 / 0.1)",
                      boxShadow: `0 0 8px ${activeColor}40`,
                    }
                  : undefined
              }
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <span
              className="text-[10px] font-medium tracking-wide leading-none"
              style={{
                textShadow: isActive ? `0 0 8px ${activeColor}80` : undefined,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
