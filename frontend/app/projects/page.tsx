"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Component to handle falling back to jpg if png doesn't exist
const ImageFallback = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image 
      src={hasError ? src.replace('.png', '.jpg') : imgSrc}
      alt={alt}
      fill
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
};

const allProjects = [
  { 
    id: 1,
    title: "Modern Residential Windows", 
    category: "Windows",
    desc: "Minimalist black aluminium frames for a contemporary home", 
    img: "/projects/project_1.png" 
  },
  { 
    id: 2,
    title: "Modern Ceiling",
    category: "Ceiling",
    desc: "Sleek suspended aluminium ceiling grid featuring integrated lighting, providing a clean, contemporary aesthetic for corporate and commercial spaces.", 
    img: "/projects/project_2.png"
  },
  { 
    id: 3,
    title: "Luxury Patio Sliding Doors", 
    category: "Doors",
    desc: "Premium grey finish sliding doors connecting indoor & outdoor", 
    img: "/projects/project_3.png" 
  },
  { 
    id: 4,
    title: "Commercial Storefront", 
    category: "Doors",
    desc: "Sleek and inviting black aluminium frames creating a premium and contemporary retail storefront experience.", 
    img: "/projects/project_4.png" 
  },
  { 
    id: 5,
    title: "Modern Kitchen Cupboards", 
    category: "Cupboards",
    desc: "Professional and bright commercial interior featuring sleek aluminium glass partitions for a modern workspace.", 
    img: "/projects/project_5.png" 
  },
  { 
    id: 6,
    title: "Custom Aluminium Pantries", 
    category: "Pantries",
    desc: "Elegant residential balcony featuring a frameless glass balustrade supported by a minimalist aluminium bottom track.", 
    img: "/projects/project_6.png" 
  },
  { 
    id: 7,
    title: "Villa Double-Height Window Wall", 
    category: "Windows",
    desc: "Massive double-height aluminium window wall for a stunning modern villa, showing off superior structural capabilities.", 
    img: "/projects/project_7.png" 
  },
  { 
    id: 8,
    title: "Suspended Suspended Ceilings", 
    category: "Ceilings",
    desc: "Stylish aluminium louvre sunshade system installed on the exterior of a contemporary building for optimal climate control.", 
    img: "/projects/project_8.png" 
  }
];

const categories = ["All", ...Array.from(new Set(allProjects.map((p) => p.category)))];

export default function ProjectsGallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = allProjects.filter((project) => 
    activeCategory === "All" || project.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black pb-24">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <div className="relative pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-16">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              AluMate
            </span>
          </div>
        </nav>

        {/* Header Content */}
        <div className="max-w-3xl mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Our Work Repository
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-zinc-400 leading-relaxed"
          >
            Explore our extensive portfolio of premium aluminium fabrication projects across residential, commercial, and architectural sectors. Every project represents our commitment to precision engineering and quality excellence.
          </motion.p>
        </div>

        {/* Filter Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              >
                <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-zinc-500 hover:shadow-[0_0_40px_rgba(161,161,170,0.15)] group overflow-hidden flex flex-col cursor-pointer relative">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none z-0" />
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-zinc-800 shrink-0 z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <span className="text-zinc-600 text-sm">Image not available</span>
                    </div>
                    <ImageFallback 
                      src={project.img} 
                      alt={project.title}
                      className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay gradent for image text */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent z-20" />
                    
                    {/* Category Badge over image */}
                    <div className="absolute top-4 left-4 z-30">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-zinc-200">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 relative flex-grow flex flex-col justify-between -mt-8 pt-0 z-30 pointer-events-none">
                    <div className="relative pt-4">
                      <h3 className="mb-3 text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors flex items-start justify-between">
                        <span className="line-clamp-2">{project.title}</span>
                        <ExternalLink className="h-4 w-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 ml-2" />
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                        {project.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Empty state (in case filtering yields no results, though mathematically impossible with this setup) */}
        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-500 text-lg">No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
