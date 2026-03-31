"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, RefreshCw, Search, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectTable } from "@/components/admin/projects/ProjectTable";
import { AddProjectDialog } from "@/components/admin/projects/AddProjectDialog";
import { projectsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROJECTS } from "@/constants/projects";
import { toast } from "sonner";
import type { Project } from "@/types";

const categories = ["All", "Windows", "Doors", "Cupboards", "Pantries", "Ceilings"];

// Transform static project to API format for display
function transformStaticProject(project: typeof PROJECTS[0]): Project {
  return {
    _id: `static-${project.id}`,
    title: project.title,
    description: project.desc,
    category: project.category,
    imageUrls: [project.img],
    rating: project.rating,
    reviewCount: project.reviewCount,
    feedbacks: project.feedbacks,
    isActive: true,
    createdAt: project.createdAt,
    updatedAt: project.createdAt,
  };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasDbProjects, setHasDbProjects] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectsApi.getAllAdmin();
      const dbProjects = response.data || [];

      if (dbProjects.length > 0) {
        setProjects(dbProjects);
        setHasDbProjects(true);
      } else {
        // Show static projects as fallback when database is empty
        setProjects(PROJECTS.map(transformStaticProject));
        setHasDbProjects(false);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      // Fallback to static data on error
      setProjects(PROJECTS.map(transformStaticProject));
      setHasDbProjects(false);
    } finally {
      setIsLoading(false);
    }
  };

  const importStaticProjects = async () => {
    setIsImporting(true);
    try {
      let imported = 0;
      for (const project of PROJECTS) {
        const formData = new FormData();
        formData.append("title", project.title);
        formData.append("description", project.desc);
        formData.append("category", project.category);
        formData.append("rating", String(project.rating));
        formData.append("reviewCount", String(project.reviewCount));

        // Fetch the static image and append it
        try {
          const imageResponse = await fetch(project.img);
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const fileName = project.img.split('/').pop() || 'image.png';
            formData.append("images", blob, fileName);
          }
        } catch {
          // Skip image if fetch fails
        }

        await projectsApi.create(formData);
        imported++;
      }
      toast.success(`Imported ${imported} projects to database`);
      fetchProjects();
    } catch (error) {
      console.error("Failed to import projects:", error);
      toast.error("Failed to import some projects");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = (projects || []).filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="Completed Projects">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-fuchsia-400" />
              Completed Projects
            </h2>
            <p className="mt-1 text-zinc-400">
              Manage completed projects displayed on the landing page gallery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!hasDbProjects && projects.length > 0 && (
              <Button
                variant="outline"
                onClick={importStaticProjects}
                disabled={isImporting}
                className="bg-fuchsia-500/20 text-white/90 hover:text-white border border-fuchsia-500/40 hover:bg-fuchsia-500/30 hover:border-fuchsia-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(217,70,239,0.1)]"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importing..." : "Import to Database"}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchProjects}
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <AddProjectDialog onSuccess={fetchProjects} />
          </div>
        </div>

        {/* Info banner for static projects */}
        {!hasDbProjects && projects.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-300 text-sm">
              These are placeholder projects from static data. Click "Import to Database" to make them editable, or add new projects using the "Add New Project" button.
            </p>
          </div>
        )}

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-fuchsia-500/20 text-white/90 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.1)]"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : (
            <ProjectTable projects={filteredProjects} onRefresh={fetchProjects} isStaticData={!hasDbProjects} />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
