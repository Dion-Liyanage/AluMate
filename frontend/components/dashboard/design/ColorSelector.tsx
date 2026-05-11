"use client";

import { useState } from "react";
import { colorOptions, ColorOption } from "./quotationConfig";
import { Check, Paintbrush } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ColorSelectorProps {
  value: string;
  customColor: string;
  onChange: (value: string) => void;
  onCustomColorChange: (hex: string) => void;
}

export function ColorSelector({
  value,
  customColor,
  onChange,
  onCustomColorChange,
}: ColorSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (opt: ColorOption) => {
    onChange(opt.value);
    if (opt.isCustom) {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Paintbrush className="h-3.5 w-3.5" />
        Color & Finish
        <span className="ml-2 text-[10px] font-medium text-amber-400/80 normal-case tracking-normal">
          Required
        </span>
      </h4>
      <div className="flex flex-wrap gap-3">
        {colorOptions.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className="group flex flex-col items-center gap-1.5"
              title={opt.label}
            >
              <div
                className={`relative h-10 w-10 rounded-full border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-violet-400 scale-110 shadow-[0_0_14px_rgba(139,92,246,0.3)]"
                    : "border-zinc-700 hover:border-zinc-500 hover:scale-105"
                }`}
                style={{
                  background: opt.isCustom
                    ? `conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7, #f43f5e)`
                    : opt.hex,
                }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`h-4 w-4 ${
                        opt.value === "white" ? "text-zinc-900" : "text-white"
                      }`}
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom color input */}
      {(showCustomInput || value === "custom") && (
        <div className="flex items-center gap-3 pt-2">
          <div
            className="h-8 w-8 rounded-lg border border-zinc-700"
            style={{ backgroundColor: customColor || "#6366f1" }}
          />
          <Input
            type="text"
            placeholder="Enter hex color (e.g. #FF5733)"
            value={customColor}
            onChange={(e) => onCustomColorChange(e.target.value)}
            className="flex-1 bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm"
          />
        </div>
      )}
    </div>
  );
}
