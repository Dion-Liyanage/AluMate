"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface PurposeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const STATIC_PURPOSES = [
  "Kitchen",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Other (comment)",
];

export function PurposeSelector({ value, onChange }: PurposeSelectorProps) {
  const [otherComment, setOtherComment] = useState("");

  const handleSelect = (purpose: string) => {
    if (purpose === "Other (comment)") {
      // select placeholder until comment provided
      onChange("Other");
      return;
    }
    onChange(purpose);
  };

  const handleOtherChange = (text: string) => {
    setOtherComment(text);
    onChange(`Other: ${text}`);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Purpose
        <span className="ml-2 text-[10px] font-medium text-amber-400/80 normal-case tracking-normal">
          Required
        </span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STATIC_PURPOSES.map((purpose) => {
          const isSelected = value === purpose || (purpose === "Other (comment)" && value?.startsWith("Other"));
          return (
            <button
              key={purpose}
              type="button"
              onClick={() => handleSelect(purpose)}
              className={`relative flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.1)]"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-500"
                    : "border-zinc-600 bg-transparent"
                }`}
              >
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </div>
              {purpose}
            </button>
          );
        })}
      </div>

      {/* Other comment input */}
      {value?.startsWith("Other") && (
        <textarea
          placeholder="Add details..."
          value={otherComment}
          onChange={(e) => handleOtherChange(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/30 p-3 text-sm text-zinc-200 placeholder:text-zinc-500"
          rows={3}
        />
      )}
    </div>
  );
}
