"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface IssueInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IssueInput({ value, onChange, disabled }: IssueInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="issue-description" className="text-sm font-medium text-zinc-300">
        Issue Description
      </Label>
      <Textarea
        id="issue-description"
        placeholder="E.g. The sliding door is stuck and not moving smoothly..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[120px] bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 transition-all focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 resize-y"
      />
      <p className="text-xs text-zinc-500">
        Please describe the problem you are facing in detail to help our technicians.
      </p>
    </div>
  );
}
