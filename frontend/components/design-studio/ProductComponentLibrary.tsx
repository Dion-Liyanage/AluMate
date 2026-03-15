"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AluminiumComponent } from "./aluminiumComponents";

interface ProductComponentLibraryProps {
  components: AluminiumComponent[];
  onAddComponent: (component: AluminiumComponent) => void;
}

export default function ProductComponentLibrary({
  components,
  onAddComponent,
}: ProductComponentLibraryProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-zinc-300 px-3 pt-3 pb-2 uppercase tracking-wider">
        Components
      </h3>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5">
        {components.map((comp, i) => (
          <motion.button
            key={comp.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onAddComponent(comp)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-violet-500/40 transition-all group cursor-pointer text-left"
          >
            <span className="text-xl flex-shrink-0">{comp.icon}</span>
            <span className="text-sm text-zinc-300 group-hover:text-violet-300 transition-colors truncate flex-1">
              {comp.name}
            </span>
            <Plus className="h-3.5 w-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
