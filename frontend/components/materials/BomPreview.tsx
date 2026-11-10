"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Layers, Ruler, Scale, Scissors } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BomResult } from "@/types";
import { formatFeetInches, formatKg, formatLKR } from "@/lib/units";

interface BomPreviewProps {
  bom: BomResult;
  /** Customer view: summary first, cut list behind a toggle, no per-line prices. */
  compact?: boolean;
  /** Show per-line costs, the per-profile bar summary and the cost breakdown. */
  showCosts?: boolean;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export function BomPreview({ bom, compact = false, showCosts = false }: BomPreviewProps) {
  const [showCutList, setShowCutList] = useState(!compact);
  const pieces = bom.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-zinc-100">{bom.templateName}</span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          {bom.sizeBand}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={<Scale className="h-3 w-3" />} label="Aluminium" value={formatKg(bom.totals.aluminiumWeightKg)} />
        <Stat icon={<Ruler className="h-3 w-3" />} label="Profile length" value={`${bom.totals.totalLengthFt.toFixed(1)} ft`} />
        <Stat icon={<Scissors className="h-3 w-3" />} label="Pieces" value={String(pieces)} />
        <Stat icon={<Layers className="h-3 w-3" />} label="Profiles" value={String(bom.profiles.length)} />
      </div>

      {bom.warnings.length > 0 && (
        <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          {bom.warnings.map((warning) => (
            <p key={warning} className="flex items-start gap-2 text-[11px] text-amber-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}

      {compact && (
        <button
          type="button"
          onClick={() => setShowCutList((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          {showCutList ? "Hide cut list" : `View cut list (${pieces} pieces)`}
          {showCutList ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}

      {showCutList && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase text-zinc-500">Component</TableHead>
                <TableHead className="text-[10px] uppercase text-zinc-500">Profile</TableHead>
                <TableHead className="text-center text-[10px] uppercase text-zinc-500">Qty</TableHead>
                <TableHead className="text-right text-[10px] uppercase text-zinc-500">Cut length</TableHead>
                <TableHead className="text-center text-[10px] uppercase text-zinc-500">Angle</TableHead>
                <TableHead className="text-right text-[10px] uppercase text-zinc-500">Weight</TableHead>
                {showCosts && <TableHead className="text-right text-[10px] uppercase text-zinc-500">Cost</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bom.lines.map((line, index) => (
                <TableRow key={`${line.component}-${index}`} className="border-zinc-800/60">
                  <TableCell className="py-2 text-xs text-zinc-200">{line.component}</TableCell>
                  <TableCell className="py-2">
                    <span className="font-mono text-[11px] text-sky-300">{line.profileCode}</span>
                    <span className="block text-[10px] text-zinc-500">
                      {line.profileName} · {line.thicknessMm}mm
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-center text-xs text-zinc-200">{line.quantity}</TableCell>
                  <TableCell className="py-2 text-right font-mono text-xs text-zinc-200">
                    {formatFeetInches(line.cutLengthIn)}
                  </TableCell>
                  <TableCell className="py-2 text-center text-xs text-zinc-400">{line.cutAngle}°</TableCell>
                  <TableCell className="py-2 text-right text-xs text-zinc-400">{formatKg(line.weightKg)}</TableCell>
                  {showCosts && (
                    <TableCell className="py-2 text-right text-xs text-zinc-200">{formatLKR(line.cost)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showCosts && (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase text-zinc-500">Profile to purchase</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Total length</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Bars to buy</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">Weight</TableHead>
                  <TableHead className="text-right text-[10px] uppercase text-zinc-500">
                    {bom.pricing?.method === "per-sq-ft" ? "Workshop cost" : "Cost"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.profiles.map((profile) => (
                  <TableRow key={profile.profileCode} className="border-zinc-800/60">
                    <TableCell className="py-2">
                      <span className="font-mono text-[11px] text-sky-300">{profile.profileCode}</span>
                      <span className="ml-2 text-xs text-zinc-300">{profile.profileName}</span>
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs text-zinc-200">
                      {profile.totalLengthFt.toFixed(1)} ft
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs text-zinc-200">
                      {profile.stockToBuy?.length
                        ? profile.stockToBuy.map((s) => `${s.count} × ${s.lengthFt}ft`).join(" + ")
                        : `${profile.barsNeeded ?? profile.minimumBars} × ${profile.barLengthFt}ft`}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs text-zinc-400">{formatKg(profile.weightKg)}</TableCell>
                    <TableCell className="py-2 text-right text-xs text-zinc-200">{formatLKR(profile.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-[10px] italic text-zinc-500">
            Bars to buy are planned by the cutting optimiser, including saw-cut allowance
            {bom.totals.plannedWasteRatePct !== undefined ? ` — planned scrap ${bom.totals.plannedWasteRatePct}% of purchased aluminium.` : "."}
          </p>

          <div className="space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 text-xs">
            {bom.pricing?.method === "per-sq-ft" && (
              <p className="pb-1 text-[11px] text-zinc-400">
                {bom.inputs.billableAreaSqFt} sq.ft × {formatLKR(bom.pricing.ratePerSqFt ?? 0)} per sq.ft (all-inclusive) ={" "}
                <span className="font-semibold text-zinc-200">
                  {formatLKR(bom.totals.materialCost + bom.totals.laborCost)}
                </span>
              </p>
            )}
            {(bom.pricing?.method === "per-sq-ft"
              ? [
                  ["Material (aluminium, glass & hardware)", bom.totals.materialCost],
                  [`Labour (${bom.inputs.billableAreaSqFt} sq.ft × ${formatLKR(bom.laborRatePerSqFt)})`, bom.totals.laborCost],
                ]
              : [
                  ["Aluminium profiles", bom.totals.profileCost],
                  ["Glass", bom.totals.glassCost],
                  ["Hardware", bom.totals.hardwareCost],
                  [`Labour (${bom.inputs.billableAreaSqFt} sq.ft × ${formatLKR(bom.laborRatePerSqFt)})`, bom.totals.laborCost],
                ]
            )
              .concat(bom.totals.finishSurcharge ? [["Wood finish surcharge (30%)", bom.totals.finishSurcharge]] : [])
              .map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-zinc-400">
                  <span>{label}</span>
                  <span className="text-zinc-200">{formatLKR(value as number)}</span>
                </div>
              ))}
            <div className="flex justify-between border-t border-zinc-800 pt-1.5 text-sm font-semibold text-zinc-100">
              <span>Total</span>
              <span>{formatLKR(bom.totals.total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
