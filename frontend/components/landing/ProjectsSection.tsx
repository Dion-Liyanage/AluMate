"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, X, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace('/api/v1', '');

// Component to handle falling back to jpg if png doesn't exist
const ImageFallback = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const getImageSrc = () => {
    if (!src) return "/projects/project_1.png";
    if (src.startsWith("/uploads/")) {
      return `${API_BASE_URL}${src}`;
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

// Separate component for project cards
function ProjectCard({ project, index }: { project: DisplayProject; index: number }) {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      viewport={{ once: true }}
    >
      <Card
        className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 transition-all hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] group overflow-hidden flex flex-col relative cursor-pointer"
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
            className="object-cover relative z-10 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 z-30">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-zinc-200">
              {project.category}
            </span>
          </div>
        </div>
        <CardContent className="p-4 relative flex-grow flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <div className="flex items-center">
                 {[...Array(5)].map((_, i) => (
                   <Star
                     key={i}
                     className={`h-4 w-4 ${i < Math.floor(project.rating) ? "text-yellow-500 fill-yellow-500" : "text-zinc-600"}`}
                   />
                 ))}
               </div>
               <span className="text-sm font-medium text-zinc-300">{project.rating}</span>
               <span className="text-xs text-zinc-500">({project.reviewCount})</span>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-100">
              {project.title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
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
    </motion.div>
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

export function ProjectsSection() {
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);
      try {
        const response = await projectsApi.getAll();
        const apiProjects = (response.data || []).map(transformApiProject);

        if (apiProjects.length > 0) {
          setProjects(apiProjects);
        } else {
          setProjects(PROJECTS.map(transformStaticProject));
        }
      } catch (error) {
        console.error("Failed to fetch projects, using fallback:", error);
        setProjects(PROJECTS.map(transformStaticProject));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const sortedProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <section id="projects" className="border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Our Work
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Discover the quality and precision of our aluminium fabrication in real-world applications
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sortedProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link href="/projects">
            <Button variant="outline">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
