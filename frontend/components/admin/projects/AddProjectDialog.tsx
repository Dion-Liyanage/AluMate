"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Image as ImageIcon, X } from "lucide-react";
import { projectsApi } from "@/lib/api";
import { toast } from "sonner";

interface AddProjectDialogProps {
  onSuccess: () => void;
}

export function AddProjectDialog({ onSuccess }: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Windows",
    location: "",
    materialUsed: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        continue;
      }
      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      category: "Windows",
      location: "",
      materialUsed: "",
    });
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsLoading(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    if (formData.location) {
      submitData.append("location", formData.location);
    }
    if (formData.materialUsed) {
      submitData.append("materialUsed", formData.materialUsed);
    }
    selectedFiles.forEach((file) => {
      submitData.append("images", file);
    });

    try {
      await projectsApi.create(submitData);
      toast.success("Project added successfully");
      setIsOpen(false);
      handleClear();
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add project";
      toast.error(typeof message === "string" ? message : message[0] || "Failed to add project");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Completed Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g. Modern Residential Windows"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project, materials used, and any special features..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 min-h-[100px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g. Colombo, Sri Lanka"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialUsed">Material Used (Optional)</Label>
              <Input
                id="materialUsed"
                placeholder="e.g. Premium Black Aluminium"
                value={formData.materialUsed}
                onChange={(e) => setFormData({ ...formData, materialUsed: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Images</Label>
            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border border-zinc-800 aspect-video">
                  <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previewUrls.length < 5 && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors bg-zinc-900/50 aspect-video">
                  <ImageIcon className="h-6 w-6 text-zinc-600 mb-2" />
                  <label className="cursor-pointer text-center">
                    <span className="text-purple-400 font-medium hover:text-purple-300 text-sm">Add Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-[10px] text-zinc-500 mt-1">Max 5 images, 10MB each</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 flex justify-between items-center sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="border-zinc-800 bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                {isLoading ? "Adding..." : "Add Project"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
