"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PenTool, Grid3X3, FolderOpen, ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Customize Your Product",
    description: "Create a completely new aluminium design tailored to your needs",
    icon: PenTool,
    href: "/dashboard/design",
    gradient: "from-violet-600/20 via-purple-600/10 to-fuchsia-600/10",
    borderColor: "border-violet-500/30 hover:border-violet-400/50",
    iconColor: "text-violet-400",
    glowColor: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    featured: true,
  },
  {
    title: "Browse Design Catalogue",
    description: "Choose from our collection of pre-designed aluminium products",
    icon: Grid3X3,
    href: "/dashboard/catalogue",
    gradient: "from-sky-600/20 via-blue-600/10 to-cyan-600/10",
    borderColor: "border-sky-500/30 hover:border-sky-400/50",
    iconColor: "text-sky-400",
    glowColor: "shadow-[0_0_20px_rgba(56,189,248,0.1)]",
    featured: false,
  },
  {
    title: "View Past Projects",
    description: "Explore completed fabrication work for inspiration and trust",
    icon: FolderOpen,
    href: "/dashboard/projects",
    gradient: "from-emerald-600/20 via-green-600/10 to-teal-600/10",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/50",
    iconColor: "text-emerald-400",
    glowColor: "shadow-[0_0_20px_rgba(52,211,153,0.1)]",
    featured: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export function DesignEntryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.href}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link href={card.href} className="block group h-full">
            <div
              className={`relative h-full rounded-xl border bg-gradient-to-br ${card.gradient} ${card.borderColor} ${card.glowColor} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              {/* Featured badge */}
              {card.featured && (
                <div className="absolute -top-2.5 left-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/90 px-3 py-0.5 text-[11px] font-semibold text-white shadow-md">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-900/80 ${card.iconColor}`}
              >
                <card.icon className="h-6 w-6" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {card.title}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                {card.description}
              </p>

              {/* CTA arrow */}
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
