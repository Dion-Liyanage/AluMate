"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, FolderOpen, Star, MapPin, Eye, EyeOff } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { projectsApi } from "@/lib/api";
import { toast } from "sonner";
import type { Project } from "@/types";

interface ProjectTableProps {
  projects: Project[];
  onRefresh: () => void;
  isStaticData?: boolean;
}

export function ProjectTable({ projects, onRefresh, isStaticData = false }: ProjectTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Windows",
    location: "",
    completedDate: "",
  });

  const openEditDialog = (project: Project) => {
    setActiveProject(project);
    setSelectedFiles([]);
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      location: project.location || "",
      completedDate: project.completedAt ? project.completedAt.split('T')[0] : "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    setIsDeleting(id);
    try {
      await projectsApi.delete(id);
      toast.success("Project deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    setIsEditing(true);
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    if (formData.location) {
      submitData.append("location", formData.location);
    }
    if (formData.completedDate) {
      submitData.append("completedAt", formData.completedDate);
    }
    selectedFiles.forEach((file) => {
      submitData.append("images", file);
    });

    try {
      await projectsApi.update(activeProject._id, submitData);
      toast.success("Project updated successfully");
      setActiveProject(null);
      onRefresh();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update project";
      toast.error(typeof message === "string" ? message : message[0] || "Failed to update project");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 py-14 text-center text-zinc-500">
          No completed projects found. Add your first project to showcase on the landing page.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-purple-500/40 transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
              <div className="relative h-40 bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800">
                {project.imageUrls && project.imageUrls.length > 0 ? (
                  <img
                    src={
                      project.imageUrls[0].startsWith("/")
                        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${project.imageUrls[0]}`
                        : project.imageUrls[0]
                    }
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FolderOpen className="h-8 w-8 text-zinc-600" />
                )}
                {project.rating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-zinc-200">{project.rating}</span>
                  </div>
                )}
              </div>
              <CardContent className="relative p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-100 line-clamp-1">{project.title}</h3>
                </div>

                <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>

                {project.location && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    <span>{project.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-zinc-900 text-zinc-400 border-zinc-700 capitalize"
                  >
                    {project.category}
                  </Badge>

                  <div className="flex items-center gap-1">
                    {isStaticData ? (
                      <span className="text-xs text-zinc-500 italic">Import to enable editing</span>
                    ) : (
                      <>
                        <Dialog
                          open={activeProject?._id === project._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setActiveProject(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                              onClick={() => openEditDialog(project)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Project</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) =>
                                      setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                      setFormData({ ...formData, category: value })
                                    }
                                  >
                                    <SelectTrigger
                                      id="edit-category"
                                      className="bg-zinc-900 border-zinc-800"
                                    >
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                      <SelectItem value="Windows">Windows</SelectItem>
                                      <SelectItem value="Doors">Doors</SelectItem>
                                      <SelectItem value="Cupboards">Cupboards</SelectItem>
                                      <SelectItem value="Pantries">Pantries</SelectItem>
                                      <SelectItem value="Ceilings">Ceilings</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                  }
                                  className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                                  required
                                />
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-location">Location</Label>
                                  <Input
                                    id="edit-location"
                                    value={formData.location}
                                    onChange={(e) =>
                                      setFormData({ ...formData, location: e.target.value })
                                    }
                                    className="bg-zinc-900 border-zinc-800"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-completedDate">Completed Date (Optional)</Label>
                                  <DatePicker
                                    id="edit-completedDate"
                                    value={formData.completedDate}
                                    onChange={(val) =>
                                      setFormData({ ...formData, completedDate: val })
                                    }
                                    placeholder="Pick a date"
                                    className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                                  />
                                </div>
                              </div>


                              <div className="space-y-2">
                                <Label htmlFor="edit-images">Replace Images (Optional)</Label>
                                <Input
                                  id="edit-images"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="bg-zinc-900 border-zinc-800"
                                  onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files || []);
                                    if (selectedFiles.length > 5) {
                                      toast.error("You can only upload a maximum of 5 images");
                                      e.target.value = "";
                                      return;
                                    }
                                    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
                                    if (totalSize > 20 * 1024 * 1024) {
                                      toast.error("Total size of all images cannot exceed 20MB");
                                      e.target.value = "";
                                      return;
                                    }
                                    setSelectedFiles(selectedFiles);
                                  }}
                                />
                                <p className="text-xs text-zinc-500">
                                  Leave empty to keep current images. Max 5 images, 20MB total capacity.
                                </p>
                              </div>

                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-zinc-400 hover:text-zinc-100"
                                  onClick={() => setActiveProject(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isEditing}
                                  className="bg-purple-600 hover:bg-purple-500 text-white"
                                >
                                  {isEditing ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => handleDelete(project._id)}
                          disabled={isDeleting === project._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
