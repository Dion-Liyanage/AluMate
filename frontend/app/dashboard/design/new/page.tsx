"use client";

import { motion } from "framer-motion";
import { PenTool, ArrowRight, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const productTypes = [
  { 
    name: "Window", 
    image: "https://res.cloudinary.com/dcetlwlfb/image/upload/alumate/assets/window-neon.png",
    description: "Sliding, casement, fixed & louvre windows" 
  },
  { 
    name: "Door", 
    image: "https://res.cloudinary.com/dcetlwlfb/image/upload/alumate/assets/door-neon.png",
    description: "Entrance, sliding, folding & French doors" 
  },
  { 
    name: "Pantry", 
    image: "https://res.cloudinary.com/dcetlwlfb/image/upload/alumate/assets/pantry-neon.png",
    description: "Kitchen pantries & modular storage units" 
  },
  { 
    name: "Cupboard", 
    image: "https://res.cloudinary.com/dcetlwlfb/image/upload/alumate/assets/cupboard-neon.png",
    description: "Kitchen, wardrobe & storage cupboards" 
  },
];

export default function DesignPage() {
  const router = useRouter();

  const handleSelect = (productName: string) => {
    router.push(`/dashboard/design/studio?type=${productName.toLowerCase()}`);
  };

  return (
    <DashboardLayout title="Customize Product">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/30 border border-violet-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] relative group">
                <PenTool className="h-6 w-6 text-violet-100 relative z-10" />
              </div>
              Select Product Type
            </h2>
            <p className="mt-1 text-zinc-400">
              Choose the type of aluminium product you want to design.
            </p>
          </div>

          <Link
            href="/dashboard/design/saved"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20 hover:text-white hover:border-violet-400/60"
          >
            <Bookmark className="h-4 w-4" />
            Saved Designs
          </Link>
        </motion.div>

        {/* Product Type Grid */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productTypes.map((type, i) => (
            <motion.div
              key={type.name}
              variants={itemVariants}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card
                onClick={() => handleSelect(type.name)}
                className="h-full relative overflow-hidden bg-zinc-950 border-zinc-800 hover:border-violet-500/50 transition-all duration-500 cursor-pointer group hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
              >
                {/* Background Image with Tint */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={type.image} 
                    alt={type.name}
                    className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-br from-violet-600/10 via-zinc-950/90 to-zinc-950" />
                  
                  {/* Neon Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Shimmer Wave Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.05)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%] animate-[shimmer_3s_linear_infinite]" />
                </div>

                <CardContent className="relative z-20 min-h-40 flex flex-col justify-end p-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-violet-300 transition-colors tracking-tight">
                      {type.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">
                      {type.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-[10px] text-violet-400/70 group-hover:text-violet-400 transition-all uppercase font-black tracking-[0.2em]">
                    <span className="relative">
                      Start Designing
                      <div className="absolute -bottom-1 left-0 w-0 h-px bg-violet-400 transition-all duration-300 group-hover:w-full" />
                    </span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
