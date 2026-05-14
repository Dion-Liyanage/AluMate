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
import { Edit, Trash2, LayoutGrid, Box as CubeIcon, CheckCircle2, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { designsApi } from "@/lib/api";
import { Design3DViewer } from "@/components/catalogue/Design3DViewer";
import { toast } from "sonner";

interface Design {
  _id: string;
  designCode: string;
  title: string;
  category: string;
  description: string;
  imageUrls?: string[];
  modelUrl?: string;
}

interface DesignTableProps {
  designs: Design[];
  onRefresh: () => void;
}

export function DesignTable({ designs, onRefresh }: DesignTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [activeDesign, setActiveDesign] = useState<Design | null>(null);
  const [formData, setFormData] = useState({
    designCode: "",
    title: "",
    description: "",
    category: "doors",
  });

  const openEditDialog = (design: Design) => {
    setActiveDesign(design);
    setSelectedFile(null);
    setSelectedModelFile(null);
    setFormData({
      designCode: design.designCode,
      title: design.title,
      description: design.description,
      category: design.category,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;
    
    setIsDeleting(id);
    try {
      await designsApi.delete(id);
      toast.success("Design deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete design");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDesign) return;

    setIsEditing(true);
    const submitData = new FormData();
    submitData.append("designCode", formData.designCode);
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    
    if (selectedFile) {
      submitData.append("images", selectedFile);
    }

    if (selectedModelFile) {
      submitData.append("model", selectedModelFile);
    }

    try {
      await designsApi.update(activeDesign._id, submitData);
      toast.success("Design updated successfully");
      setActiveDesign(null);
      onRefresh();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update design";
      toast.error(typeof message === "string" ? message : message[0] || "Failed to update design");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      {designs.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 py-14 text-center text-zinc-500">
          No designs found in the catalogue.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <Card
              key={design._id}
              className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-sky-500/40 transition-all group overflow-hidden hover:shadow-[0_0_20px_rgba(56,189,248,0.08)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
              <div className="relative h-64 bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800">
                {design.modelUrl ? (
                  <Design3DViewer modelUrl={design.modelUrl} />
                ) : design.imageUrls && design.imageUrls.length > 0 ? (
                  <img
                    src={design.imageUrls[0].startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${design.imageUrls[0]}` : design.imageUrls[0]}
                    alt={design.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LayoutGrid className="h-10 w-10 text-zinc-600" />
                )}
                {/* 3D label is now managed by Design3DViewer component */}
              </div>
              <CardContent className="relative pt-0 px-4 pb-0 -mt-3">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">{design.designCode}</span>
                  <h3 className="font-semibold text-zinc-100 line-clamp-1">{design.title}</h3>
                </div>


                <div className="flex items-center justify-between mt-4 -mb-1">
                  <Badge variant="outline" className="bg-sky-500/10 text-sky-300 border-sky-500/20 capitalize group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-colors">
                    {design.category}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/dashboard/catalogue/${design._id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 group-hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Dialog
                      open={activeDesign?._id === design._id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setActiveDesign(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 group-hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                          onClick={() => openEditDialog(design)}
                          title="Edit Design"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                          <DialogTitle>Edit Design</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label htmlFor="edit-designCode">Design Number / SKU</Label>
                            <Input
                              id="edit-designCode"
                              value={formData.designCode}
                              onChange={(e) => setFormData({ ...formData, designCode: e.target.value })}
                              className="bg-zinc-900 border-zinc-800"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="bg-zinc-900 border-zinc-800"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger id="edit-category" className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="doors">Doors</SelectItem>
                                <SelectItem value="windows">Windows</SelectItem>
                                <SelectItem value="cupboards">Cupboards</SelectItem>
                                <SelectItem value="pantries">Pantries</SelectItem>
                                <SelectItem value="ceilings">Ceilings</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-images">Replace Image</Label>
                              <Input
                                id="edit-images"
                                type="file"
                                accept="image/*"
                                className="bg-zinc-900 border-zinc-800"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (!file) {
                                    setSelectedFile(null);
                                    return;
                                  }
                                  if (file.size > 10 * 1024 * 1024) {
                                    toast.error("Image size must be 10MB or less");
                                    e.target.value = "";
                                    setSelectedFile(null);
                                    return;
                                  }
                                  setSelectedFile(file);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-model">Replace 3D Model (.glb)</Label>
                              <div className={`relative flex items-center justify-center border-2 border-dashed rounded-lg p-2 transition-all min-h-[40px] ${
                                selectedModelFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/50'
                              }`}>
                                <input
                                  id="edit-model"
                                  type="file"
                                  accept=".glb"
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (!file) {
                                      setSelectedModelFile(null);
                                      return;
                                    }
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.error("Model size must be 50MB or less");
                                      setSelectedModelFile(null);
                                      return;
                                    }
                                    setSelectedModelFile(file);
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  {selectedModelFile ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <CubeIcon className="h-4 w-4 text-zinc-500" />
                                  )}
                                  <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                                    {selectedModelFile ? selectedModelFile.name : (design.modelUrl ? "Update Current Model" : "Upload Model")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="pt-4">
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-zinc-400 hover:text-zinc-100"
                              onClick={() => setActiveDesign(null)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isEditing} className="bg-sky-600 hover:bg-sky-500 text-white min-w-[100px]">
                              {isEditing ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 group-hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      onClick={() => handleDelete(design._id)}
                      disabled={isDeleting === design._id}
                      title="Delete Design"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
