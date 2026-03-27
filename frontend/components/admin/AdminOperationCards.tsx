"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ClipboardList, LayoutGrid, BarChart3, ArrowRight, FolderOpen } from "lucide-react";

const cards = [
  {
    title: "Manage Orders",
    description: "Review designs, generate quotations, and track order progress",
    icon: ClipboardList,
    href: "/admin/orders",
    gradient: "from-blue-600/20 via-indigo-600/10 to-violet-600/10",
    borderColor: "border-blue-500/30 hover:border-blue-400/50",
    iconColor: "text-blue-400",
    glowColor: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    featured: true,
  },
  {
    title: "Manage Catalogue",
    description: "Manage pre-designed aluminium products and categories",
    icon: LayoutGrid,
    href: "/admin/designs",
    gradient: "from-amber-600/20 via-orange-600/10 to-red-600/10",
    borderColor: "border-amber-500/30 hover:border-amber-400/50",
    iconColor: "text-amber-400",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    featured: false,
  },
  {
    title: "Completed Projects",
    description: "Showcase finished projects on the landing page gallery",
    icon: FolderOpen,
    href: "/admin/projects",
    gradient: "from-teal-600/20 via-cyan-600/10 to-sky-600/10",
    borderColor: "border-teal-500/30 hover:border-teal-400/50",
    iconColor: "text-teal-400",
    glowColor: "shadow-[0_0_20px_rgba(20,184,166,0.1)]",
    featured: false,
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export function AdminOperationCards() {
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
              {/* Shimmer wave */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
              
              {/* Decorative background icon */}
              <div className="absolute top-8 right-8 opacity-[0.07] pointer-events-none group-hover:opacity-10 transition-opacity">
                <card.icon className={`w-48 h-48 ${card.iconColor}`} />
              </div>
              
              {/* Featured badge */}
              {card.featured && (
                <div className="absolute -top-2.5 left-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-3 py-0.5 text-[11px] font-semibold text-white shadow-md">
                    ⚡ Core Operation
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
                Manage now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
