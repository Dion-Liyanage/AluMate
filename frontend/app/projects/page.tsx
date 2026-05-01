"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Star, X, Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PROJECTS } from "@/constants/projects";
import { projectsApi } from "@/lib/api";

interface DisplayProject {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
    imageUrls: string[];
  rating: number;
  reviewCount: number;
  feedbacks: { name: string; comment: string; rating: number }[];
  location?: string;
  completedAt?: string;
  createdAt: string;
}

// Component to handle falling back to jpg if png doesn't exist
const ImageFallback = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Handle API URLs vs static URLs
  const getImageSrc = () => {
    if (!src) return "/projects/project_1.png";
    if (src.startsWith("/uploads/")) {
      // Remove /api/v1 prefix from API URL to get base server URL for static files
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace('/api/v1', '');
      return `${baseUrl}${src}`;
    }
    return hasError ? src.replace('.png', '.jpg') : imgSrc;
  };

  const resolvedSrc = getImageSrc();

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      unoptimized={resolvedSrc.startsWith("http://")}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
};

// Separate component for project cards to properly handle useState
function ProjectCard({ project }: { project: DisplayProject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const allImages = project.imageUrls && project.imageUrls.length > 0 ? project.imageUrls : [project.imageUrl];
  const currentImage = allImages[selectedImageIndex] || project.imageUrl;

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Card
        className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] group overflow-hidden flex flex-col cursor-pointer relative"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none z-0" />
        <div className="relative h-40 w-full overflow-hidden bg-zinc-800 shrink-0 z-10 border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-zinc-600 text-sm">Image not available</span>
          </div>
          <ImageFallback
            src={project.imageUrl}
            alt={project.title}
            className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent z-20" />

          <div className="absolute top-4 left-4 z-30">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-zinc-200">
              {project.category}
            </span>
          </div>
        </div>

        <CardContent className="p-4 relative flex-grow flex flex-col justify-between">
          <div className="relative pt-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="flex items-center">
                 {[...Array(5)].map((_, i) => (
                   <Star
                     key={i}
                     className={`h-3 w-3 ${i < Math.floor(project.rating) ? "text-yellow-500 fill-yellow-500" : "text-zinc-600"}`}
                   />
                 ))}
               </div>
               <span className="text-xs font-medium text-zinc-300">{project.rating}</span>
               <span className="text-[10px] text-zinc-500">({project.reviewCount})</span>
            </div>
            <h3 className="mb-3 text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors flex items-start justify-between">
              <span className="line-clamp-2">{project.title}</span>
              <ExternalLink className="h-4 w-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 ml-2" />
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 w-full">
              <ImageFallback src={currentImage} alt={`${project.title} image ${selectedImageIndex + 1}`} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 left-8">
                 <h2 className="text-3xl font-bold text-white">{project.title}</h2>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400 mb-1">{project.category}</span>
                    <div className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.floor(project.rating) ? "text-yellow-500 fill-yellow-500" : "text-zinc-600"}`} />
                      ))}
                    </div>
                    <span className="text-zinc-300 font-medium">{project.rating}</span>
                 </div>
              </div>
            </div>
            <div className="p-8">
              {/* Project Details */}
              <div className="mb-6">
                              {/* Image Gallery */}
                              {allImages.length > 0 && (
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-zinc-100 mb-3 border-b border-zinc-800 pb-2 flex items-center justify-between">
                                    <span>Project Images</span>
                                    {allImages.length > 1 && (
                                      <span className="text-xs font-normal text-zinc-500">{selectedImageIndex + 1} / {allImages.length}</span>
                                    )}
                                  </h3>
                  
                                  {/* Thumbnail Gallery */}
                                  {allImages.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                                      {allImages.map((img, idx) => (
                                        <button
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageIndex(idx);
                                          }}
                                          className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 transition-all overflow-hidden ${
                                            selectedImageIndex === idx
                                              ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                              : "border-zinc-700 hover:border-zinc-600"
                                          }`}
                                        >
                                          <ImageFallback 
                                            src={img} 
                                            alt={`${project.title} thumbnail ${idx + 1}`}
                                            className="object-cover w-full h-full"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                <h3 className="text-lg font-semibold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">About This Project</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {project.location && (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  {project.completedAt && (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <span>Completed {new Date(project.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Customer Feedback</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {project.feedbacks && project.feedbacks.length > 0 ? (
                  project.feedbacks.map((fb, i) => (
                    <div key={i} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-zinc-200">{fb.name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-3 w-3 ${j < fb.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-600"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm italic">"{fb.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-zinc-500 italic text-sm">No detailed feedback available yet for this project.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Transform static project data to display format
function transformStaticProject(project: typeof PROJECTS[0]): DisplayProject {
  return {
    id: String(project.id),
    title: project.title,
    category: project.category,
    description: project.desc,
    imageUrl: project.img,
      imageUrls: [project.img],
    rating: project.rating,
    reviewCount: project.reviewCount,
    feedbacks: project.feedbacks,
    createdAt: project.createdAt,
  };
}

// Transform API project data to display format
function transformApiProject(project: any): DisplayProject {
  return {
    id: project._id,
    title: project.title,
    category: project.category,
    description: project.description,
    imageUrl: project.imageUrls?.[0] || "",
      imageUrls: project.imageUrls || [],
    rating: project.rating || 0,
    reviewCount: project.reviewCount || 0,
    feedbacks: project.feedbacks || [],
    location: project.location || "",
    completedAt: project.completedAt || "",
    createdAt: project.createdAt,
  };
}

export default function ProjectsGallery() {
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);
      try {
        const response = await projectsApi.getAll();
        const apiProjects = (response.data || []).map(transformApiProject);

        if (apiProjects.length > 0) {
          setProjects(apiProjects);
        } else {
          // Fallback to static data if no API data
          setProjects(PROJECTS.map(transformStaticProject));
        }
      } catch (error) {
        console.error("Failed to fetch projects, using fallback:", error);
        // Fallback to static data on error
        setProjects(PROJECTS.map(transformStaticProject));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const categories = ["All", "Windows", "Doors", "Cupboards", "Pantries", "Ceilings"];
  
  const filteredProjects = sortedProjects.filter((project) => {
    const matchesCategory =
      activeCategory === "All" || project.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-12"
        >
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-zinc-500 text-lg">No projects found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
