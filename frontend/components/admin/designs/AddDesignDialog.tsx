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
import { Plus, Image as ImageIcon, X, Box as CubeIcon, CheckCircle2 } from "lucide-react";
import { designsApi } from "@/lib/api";
import { toast } from "sonner";

interface AddDesignDialogProps {
  onSuccess: () => void;
}

export function AddDesignDialog({ onSuccess }: AddDesignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "doors",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      toast.error("You can only upload a maximum of 5 images");
      return;
    }

    const currentTotalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
    const newFilesTotalSize = files.reduce((acc, f) => acc + f.size, 0);

    if (currentTotalSize + newFilesTotalSize > 20 * 1024 * 1024) {
      toast.error("Total size of all images cannot exceed 20MB");
      return;
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("3D Model size cannot exceed 50MB");
      return;
    }

    if (!file.name.endsWith('.glb')) {
      toast.error("Only .glb files are supported for 3D models");
      return;
    }

    setSelectedModelFile(file);
    toast.success(`3D Model selected: ${file.name}`);
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
      category: "doors",
    });
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setSelectedModelFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    
    selectedFiles.forEach((file) => {
      submitData.append("images", file);
    });

    if (selectedModelFile) {
      submitData.append("model", selectedModelFile);
    }

    try {
      await designsApi.create(submitData);
      toast.success("Design added to catalogue");
      setIsOpen(false);
      handleClear();
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add design";
      toast.error(typeof message === 'string' ? message : message[0] || "Failed to add design");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-500/20 text-white/90 hover:text-white border border-sky-500/40 hover:bg-sky-500/30 hover:border-sky-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(14,165,233,0.15)] gap-2">
          <Plus className="h-4 w-4" />
          Add New Design
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Add New Catalogue Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Modern Sliding Door"
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
                <SelectItem value="doors">Doors</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
                <SelectItem value="cupboards">Cupboards</SelectItem>
                <SelectItem value="pantries">Pantries</SelectItem>
                <SelectItem value="ceilings">Ceilings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the design, materials, etc."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Design Images</Label>
              <div className="grid grid-cols-2 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-zinc-800 aspect-square">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 5 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg p-2 hover:border-zinc-700 transition-colors bg-zinc-900/50 aspect-square">
                    <ImageIcon className="h-5 w-5 text-zinc-600 mb-1" />
                    <label className="cursor-pointer text-center">
                      <span className="text-sky-400 font-medium hover:text-sky-300 text-[10px]">Add Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>3D Model (Blender Export)</Label>
              <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-all h-full min-h-[120px] ${
                selectedModelFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}>
                {selectedModelFile ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-200 line-clamp-1">{selectedModelFile.name}</p>
                    <button 
                      type="button" 
                      onClick={() => setSelectedModelFile(null)}
                      className="text-[10px] text-red-400 font-bold hover:underline mt-1"
                    >
                      Remove Model
                    </button>
                  </div>
                ) : (
                  <>
                    <CubeIcon className="h-8 w-8 text-zinc-600 mb-2" />
                    <label className="cursor-pointer text-center">
                      <span className="text-sky-400 font-medium hover:text-sky-300 text-sm">Upload .glb File</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".glb"
                        onChange={handleModelFileChange}
                      />
                    </label>
                    <p className="text-[10px] text-zinc-500 mt-2">Maximum file size: 50MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 flex justify-between items-center sm:justify-between w-full">
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
                className="bg-sky-500/20 text-white/90 hover:text-white border border-sky-500/40 hover:bg-sky-500/30 hover:border-sky-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(14,165,233,0.15)] min-w-[120px]"
              >
                {isLoading ? "Uploading..." : "Add Design"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
