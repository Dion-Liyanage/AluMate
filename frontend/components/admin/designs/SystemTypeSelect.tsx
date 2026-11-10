"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SYSTEM_TYPE_CATEGORIES = ["windows", "doors"];

const OPTIONS: Record<string, { value: string; label: string }[]> = {
  windows: [
    { value: "sliding", label: "Sliding window" },
    { value: "swing", label: "Swing / casement window" },
    { value: "fixed", label: "Fixed window" },
  ],
  doors: [
    { value: "sliding", label: "Sliding door" },
    { value: "swing", label: "Swing door" },
  ],
};

interface SystemTypeSelectProps {
  id: string;
  category: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Opening system for window/door catalogue designs. It decides which
 * material template builds the cut list — customers never choose it for
 * catalogue items, so every window/door design must have one.
 */
export function SystemTypeSelect({ id, category, value, onChange }: SystemTypeSelectProps) {
  const options = OPTIONS[category];
  if (!options) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Opening System</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="bg-zinc-900 border-zinc-800">
          <SelectValue placeholder="Select opening system" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-zinc-500">
        Must match the design&apos;s 3D model — it sets which aluminium profiles and cut list are used for quotations.
      </p>
    </div>
  );
}

export const DEFAULT_SYSTEM_TYPE = "sliding";

/**
 * Value to send for the current category. Windows/doors always get a valid
 * system (default sliding); other categories clear it.
 */
export function systemTypeForSubmit(category: string, value: string) {
  const options = OPTIONS[category];
  if (!options) return "none";
  return options.some((option) => option.value === value) ? value : options[0].value;
}

const PANEL_OPTIONS = [1, 2, 3, 4, 5, 6];
const PANEL_DEFAULT = "default";

interface PanelCountSelectProps {
  id: string;
  category: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Fixed number of panels/leaves for a window/door catalogue design. Customers
 * can't change a catalogue design, so the price uses this number. Left unset,
 * pricing falls back to the opening system's default.
 */
export function PanelCountSelect({ id, category, value, onChange }: PanelCountSelectProps) {
  if (!OPTIONS[category]) return null;
  const noun = category === "doors" ? "leaves / panels" : "panels / sashes";

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Number of {noun}</Label>
      <Select value={value || PANEL_DEFAULT} onValueChange={(v) => onChange(v === PANEL_DEFAULT ? "" : v)}>
        <SelectTrigger id={id} className="bg-zinc-900 border-zinc-800">
          <SelectValue placeholder="Select number of panels" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value={PANEL_DEFAULT}>Not set (use system default)</SelectItem>
          {PANEL_OPTIONS.map((count) => (
            <SelectItem key={count} value={String(count)}>
              {count}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-zinc-500">
        Must match the design&apos;s 3D model — customers can&apos;t change it, and it is used for the price.
      </p>
    </div>
  );
}

/** Value to send: a number for windows/doors, "none" to clear it. */
export function panelCountForSubmit(category: string, value: string) {
  if (!OPTIONS[category] || !value) return "none";
  return value;
}
