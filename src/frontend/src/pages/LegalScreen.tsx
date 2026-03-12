import type { LegalArticle } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLegalArticles } from "@/hooks/useQueries";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; hue: string }
> = {
  citizens_rights: {
    label: "Citizens' Rights",
    icon: Users,
    hue: "195",
  },
  police_procedures: {
    label: "Police Procedures",
    icon: Shield,
    hue: "260",
  },
  womens_safety: {
    label: "Women's Safety",
    icon: Scale,
    hue: "300",
  },
  fir_process: {
    label: "FIR Process",
    icon: FileText,
    hue: "142",
  },
  criminal_laws: {
    label: "Criminal Laws",
    icon: BookOpen,
    hue: "85",
  },
};

const CATEGORY_ORDER = [
  "citizens_rights",
  "police_procedures",
  "womens_safety",
  "fir_process",
  "criminal_laws",
];

function getCategoryConfig(cat: string) {
  return (
    CATEGORY_CONFIG[cat] ?? {
      label: cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: BookOpen,
      hue: "260",
    }
  );
}

function ArticleCard({
  article,
  index,
  hue,
}: {
  article: LegalArticle;
  index: number;
  hue: string;
}) {
  const [open, setOpen] = useState(false);
  const ocid = `legal.item.${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="holo-card rounded-lg overflow-hidden cursor-pointer"
      style={{
        border: "1px solid oklch(0.26 0.014 260)",
        borderLeft: `2px solid oklch(0.55 0.12 ${hue} / 0.6)`,
      }}
      data-ocid={ocid}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
        style={{
          background: open ? `oklch(0.55 0.12 ${hue} / 0.06)` : "transparent",
        }}
        data-ocid="legal.tab"
      >
        <span
          className="text-sm font-medium leading-snug pr-3"
          style={{ color: "oklch(0.88 0.006 260)" }}
        >
          {article.title}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            color: `oklch(0.55 0.12 ${hue})`,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-1 text-sm leading-relaxed whitespace-pre-line border-t"
              style={{
                color: "oklch(0.58 0.012 260)",
                borderColor: `oklch(0.55 0.12 ${hue} / 0.15)`,
              }}
            >
              {article.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LegalScreen() {
  const { data: articles } = useLegalArticles();
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ORDER[0]);

  const grouped: Record<string, LegalArticle[]> = {};
  for (const article of articles ?? []) {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const activeConf = getCategoryConfig(activeCategory);
  const activeArticles = grouped[activeCategory] ?? [];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 relative">
        <div className="neon-section-header mb-1">
          <h2 className="text-xl font-bold font-display text-foreground">
            Legal Rights
          </h2>
        </div>
        <p className="text-xs pl-3" style={{ color: "oklch(0.48 0.01 260)" }}>
          Know your rights · Offline access · Indian law
        </p>
      </div>

      {/* Category tabs — horizontal scroll */}
      <div className="px-4 pb-3">
        <ScrollArea className="w-full" type="scroll">
          <div className="flex gap-2 pb-1">
            {orderedCategories.map((cat) => {
              const conf = getCategoryConfig(cat);
              const Icon = conf.icon;
              const isActive = activeCategory === cat;
              const count = (grouped[cat] ?? []).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={{
                    background: isActive
                      ? `oklch(0.55 0.12 ${conf.hue} / 0.12)`
                      : "oklch(0.16 0.012 260)",
                    border: isActive
                      ? `1px solid oklch(0.55 0.12 ${conf.hue} / 0.5)`
                      : "1px solid oklch(0.24 0.012 260)",
                    color: isActive
                      ? `oklch(0.72 0.12 ${conf.hue})`
                      : "oklch(0.5 0.01 260)",
                    boxShadow: isActive
                      ? `0 0 12px oklch(0.55 0.12 ${conf.hue} / 0.2)`
                      : "none",
                  }}
                  data-ocid="legal.tab"
                >
                  <Icon className="w-3 h-3" />
                  {conf.label}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: isActive
                        ? `oklch(0.55 0.12 ${conf.hue} / 0.2)`
                        : "oklch(0.22 0.01 260)",
                      color: isActive
                        ? `oklch(0.72 0.12 ${conf.hue})`
                        : "oklch(0.42 0.01 260)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-2" data-ocid="legal.panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-2"
            >
              {/* Category header */}
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const Icon = activeConf.icon;
                  return (
                    <Icon
                      className="w-4 h-4"
                      style={{ color: `oklch(0.65 0.12 ${activeConf.hue})` }}
                    />
                  );
                })()}
                <span
                  className="text-sm font-semibold"
                  style={{ color: `oklch(0.65 0.12 ${activeConf.hue})` }}
                >
                  {activeConf.label}
                </span>
                <Badge
                  variant="outline"
                  className="ml-auto text-xs"
                  style={{
                    borderColor: `oklch(0.55 0.12 ${activeConf.hue} / 0.3)`,
                    color: `oklch(0.55 0.12 ${activeConf.hue})`,
                  }}
                >
                  {activeArticles.length} articles
                </Badge>
              </div>

              {activeArticles.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 gap-3"
                  data-ocid="legal.empty_state"
                >
                  <Scale
                    className="w-10 h-10"
                    style={{ color: "oklch(0.35 0.01 260)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.42 0.01 260)" }}
                  >
                    No articles in this category
                  </p>
                </div>
              ) : (
                activeArticles.map((article, idx) => (
                  <ArticleCard
                    key={article.id.toString()}
                    article={article}
                    index={idx}
                    hue={activeConf.hue}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-lg px-4 py-3 mt-4"
          style={{
            background: "oklch(0.14 0.012 260)",
            border: "1px solid oklch(0.24 0.012 260)",
          }}
        >
          <p className="text-xs" style={{ color: "oklch(0.42 0.01 260)" }}>
            <span
              className="font-semibold"
              style={{ color: "oklch(0.6 0.01 260)" }}
            >
              Disclaimer:
            </span>{" "}
            For general awareness only. Not legal advice. Consult a qualified
            lawyer for specific guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
