"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  clearSignal?: number;
}

export function ImageUpload({ onImageChange, disabled, clearSignal }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset preview when clearSignal changes
  useEffect(() => {
    if (clearSignal !== undefined && clearSignal > 0) {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [clearSignal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-zinc-300">
        Upload Image
      </Label>
      
      {!previewUrl ? (
        <label 
          htmlFor="image-upload"
          className={`
            border-2 border-dashed border-zinc-700 bg-zinc-900/50 
            rounded-lg flex flex-col items-center justify-center p-6
            transition-colors duration-200
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-800 hover:border-cyan-500/50"}
          `}
        >
          <div className="bg-zinc-800 rounded-full p-3 mb-3">
            <ImagePlus className="h-6 w-6 text-zinc-400 group-hover:text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300">Click to upload</span>
          <span className="text-xs text-zinc-500 mt-1">PNG, JPG, JPEG up to 5MB</span>
        </label>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 aspect-video flex items-center justify-center group h-48 w-48">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-zinc-950/80 p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-red-500/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
