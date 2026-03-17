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
      <h3 className="px-3 pt-3 pb-2 text-sm font-semibold uppercase tracking-wider text-stone-500">
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
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50"
          >
            <span className="text-xl flex-shrink-0">{comp.icon}</span>
            <span className="flex-1 truncate text-sm text-stone-700 transition-colors group-hover:text-sky-700">
              {comp.name}
            </span>
            <Plus className="h-3.5 w-3.5 flex-shrink-0 text-stone-400 transition-colors group-hover:text-sky-600" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
