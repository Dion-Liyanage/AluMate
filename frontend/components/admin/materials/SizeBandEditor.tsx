"use client";

import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BomLineRule, MaterialProfile, SizeBand } from "@/types";

interface SizeBandEditorProps {
  band: SizeBand;
  index: number;
  total: number;
  profiles: MaterialProfile[];
  onChange: (band: SizeBand) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
}

type LimitKey = "maxWidthFt" | "maxHeightFt" | "maxAreaSqFt" | "maxPanelWidthFt";
type RateKey = "laborRatePerSqFt" | "glassRatePerSqFt" | "hardwareCostPerPanel";

const LIMITS: { key: LimitKey; label: string; unit: string }[] = [
  { key: "maxWidthFt", label: "Max width", unit: "ft" },
  { key: "maxHeightFt", label: "Max height", unit: "ft" },
  { key: "maxAreaSqFt", label: "Max area", unit: "sq.ft" },
  { key: "maxPanelWidthFt", label: "Max panel width", unit: "ft" },
];

const RATES: { key: RateKey; label: string }[] = [
  { key: "laborRatePerSqFt", label: "Labour / sq.ft" },
  { key: "glassRatePerSqFt", label: "Glass / sq.ft" },
  { key: "hardwareCostPerPanel", label: "Hardware / panel" },
];

const emptyLine = (profileCode = ""): BomLineRule => ({
  component: "",
  profileCode,
  quantityFormula: "1",
  lengthFormula: "W",
  cutAngle: 90,
});

const fieldClass = "h-8 bg-zinc-900 border-zinc-800 text-xs";

export function SizeBandEditor({
  band,
  index,
  total,
  profiles,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
}: SizeBandEditorProps) {
  const update = <K extends keyof SizeBand>(key: K, value: SizeBand[K]) => onChange({ ...band, [key]: value });

  const updateLine = (lineIndex: number, patch: Partial<BomLineRule>) =>
    update(
      "lines",
      band.lines.map((line, i) => (i === lineIndex ? { ...line, ...patch } : line))
    );

  const profilesBySeries = profiles.reduce<Record<string, MaterialProfile[]>>((groups, profile) => {
    (groups[profile.series] ??= []).push(profile);
    return groups;
  }, {});
  const knownCodes = new Set(profiles.map((p) => p.code));

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-300">
          {index + 1}
        </span>
        <Input
          value={band.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Band name, e.g. Standard – 70mm series"
          className="h-8 flex-1 min-w-48 bg-zinc-900 border-zinc-800 text-sm font-medium"
        />
        <div className="flex gap-1">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-zinc-500" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move band up">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-zinc-500" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move band down">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-zinc-500" onClick={onDuplicate} aria-label="Duplicate band">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-red-400" disabled={total === 1} onClick={onRemove} aria-label="Remove band">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Use this band when the size is within (leave blank for no limit)
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {LIMITS.map(({ key, label, unit }) => (
            <div key={key} className="space-y-1">
              <Label className="text-[11px] text-zinc-400">
                {label} <span className="text-zinc-600">({unit})</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="No limit"
                value={band[key] ?? ""}
                onChange={(event) => update(key, event.target.value === "" ? null : Number(event.target.value))}
                className={fieldClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {RATES.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-[11px] text-zinc-400">
              {label} <span className="text-zinc-600">(LKR)</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={band[key]}
              onChange={(event) => update(key, Number(event.target.value))}
              className={fieldClass}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Cut list</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="text-[10px] uppercase text-zinc-500">
                <th className="pb-1.5 pr-2 font-medium">Component</th>
                <th className="pb-1.5 pr-2 font-medium">Profile</th>
                <th className="pb-1.5 pr-2 font-medium">Quantity</th>
                <th className="pb-1.5 pr-2 font-medium">Cut length (in)</th>
                <th className="pb-1.5 pr-2 font-medium">Angle</th>
                <th className="pb-1.5" />
              </tr>
            </thead>
            <tbody>
              {band.lines.map((line, lineIndex) => (
                <tr key={lineIndex} className="align-top">
                  <td className="py-1 pr-2">
                    <Input
                      value={line.component}
                      placeholder="e.g. Outer frame – jambs"
                      onChange={(event) => updateLine(lineIndex, { component: event.target.value })}
                      className={fieldClass}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select
                      value={line.profileCode}
                      onChange={(event) => updateLine(lineIndex, { profileCode: event.target.value })}
                      className={`h-8 w-full rounded-md border px-2 font-mono text-xs text-zinc-100 bg-zinc-900 ${
                        knownCodes.has(line.profileCode) ? "border-zinc-800" : "border-red-500/60"
                      }`}
                    >
                      {!knownCodes.has(line.profileCode) && (
                        <option value={line.profileCode}>{line.profileCode || "Select profile"}</option>
                      )}
                      {Object.entries(profilesBySeries).map(([series, items]) => (
                        <optgroup key={series} label={series}>
                          {items.map((profile) => (
                            <option key={profile.code} value={profile.code}>
                              {profile.code} — {profile.name}
                              {profile.isActive ? "" : " (inactive)"}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      value={line.quantityFormula}
                      onChange={(event) => updateLine(lineIndex, { quantityFormula: event.target.value })}
                      className={`${fieldClass} font-mono`}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      value={line.lengthFormula}
                      onChange={(event) => updateLine(lineIndex, { lengthFormula: event.target.value })}
                      className={`${fieldClass} font-mono`}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select
                      value={line.cutAngle}
                      onChange={(event) => updateLine(lineIndex, { cutAngle: Number(event.target.value) as 45 | 90 })}
                      className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-100"
                    >
                      <option value={45}>45°</option>
                      <option value={90}>90°</option>
                    </select>
                  </td>
                  <td className="py-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-zinc-500 hover:text-red-400"
                      onClick={() => update("lines", band.lines.filter((_, i) => i !== lineIndex))}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            update("lines", [...band.lines, emptyLine(band.lines[band.lines.length - 1]?.profileCode ?? profiles[0]?.code)])
          }
          className="gap-1.5 border-zinc-800 bg-zinc-900/50 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add line
        </Button>
      </div>
    </div>
  );
}
