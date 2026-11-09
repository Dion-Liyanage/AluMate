"use client";

import { AlertTriangle, Recycle, Scissors, Trash2 } from "lucide-react";
import type { CuttingPlan, PlannedBar } from "@/types";
import { formatFeetInches, formatKg, formatLKR } from "@/lib/units";

interface CuttingPlanViewProps {
  plan: CuttingPlan;
}

function Stat({ label, value, tone = "text-zinc-100" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function BarStrip({ bar, barLengthIn }: { bar: PlannedBar; barLengthIn: number }) {
  const widthPct = (lengthIn: number) => `${Math.max(0, (lengthIn / barLengthIn) * 100)}%`;
  const isOffcut = bar.leftoverType === "offcut";
  const stripe = isOffcut ? "96,165,250" : "245,158,11";
  const leftoverStyle = {
    backgroundImage: `repeating-linear-gradient(45deg, rgba(${stripe},0.35) 0 6px, rgba(${stripe},0.12) 6px 12px)`,
  };
  const leftoverClass = isOffcut ? "text-sky-200" : "text-amber-200";

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-right text-[10px] font-medium text-zinc-500">Bar {bar.index}</span>
      <div className="flex h-8 flex-1 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900">
        {bar.cuts.map((cut, index) => (
          <div
            key={index}
            title={`${cut.component} — ${formatFeetInches(cut.lengthIn)}${cut.isJoint ? " (joined piece)" : ""}`}
            style={{ width: widthPct(cut.lengthIn) }}
            className={`flex items-center justify-center overflow-hidden border-r-2 border-zinc-950 text-[10px] font-semibold text-emerald-950 ${
              cut.isJoint ? "bg-emerald-300/70" : index % 2 === 0 ? "bg-emerald-400" : "bg-emerald-300"
            }`}
          >
            <span className="truncate px-1">{formatFeetInches(cut.lengthIn)}</span>
          </div>
        ))}
        {bar.leftoverIn > 0 && (
          <div
            title={`${bar.leftoverType === "offcut" ? "Reusable offcut" : "Scrap"} — ${formatFeetInches(bar.leftoverIn)}`}
            style={{ width: widthPct(bar.leftoverIn), ...leftoverStyle }}
            className={`flex items-center justify-center overflow-hidden text-[10px] font-semibold ${leftoverClass}`}
          >
            <span className="truncate px-1">{formatFeetInches(bar.leftoverIn)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CuttingPlanView({ plan }: CuttingPlanViewProps) {
  const { totals } = plan;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Bars to buy" value={String(totals.bars)} />
        <Stat label="Purchased" value={formatKg(totals.purchasedKg)} />
        <Stat label="Used" value={formatKg(totals.usedKg)} tone="text-emerald-300" />
        <Stat label="Reusable offcuts" value={formatKg(totals.reusableOffcutsKg)} tone="text-sky-300" />
        <Stat label="Scrap" value={formatKg(totals.scrapWasteKg)} tone="text-amber-300" />
        <Stat label="Efficiency" value={`${totals.efficiencyPct}%`} tone="text-emerald-300" />
      </div>

      {plan.warnings.length > 0 && (
        <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          {plan.warnings.map((warning) => (
            <p key={warning} className="flex items-start gap-2 text-[11px] text-amber-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}

      {plan.profiles.map((profile) => (
        <div key={profile.profileCode} className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs">
              <span className="font-mono text-sky-300">{profile.profileCode}</span>
              <span className="ml-2 text-zinc-300">{profile.profileName}</span>
            </p>
            <p className="text-[11px] text-zinc-500">
              {profile.barsNeeded} × {formatFeetInches(profile.barLengthIn)} bar{profile.barsNeeded === 1 ? "" : "s"} ·{" "}
              {profile.pieces} pieces · {formatLKR(profile.purchaseCost)}
            </p>
          </div>
          <div className="space-y-1.5">
            {profile.bars.map((bar) => (
              <BarStrip key={bar.index} bar={bar} barLengthIn={profile.barLengthIn} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Scissors className="h-3 w-3 text-emerald-400" /> Cut piece
        </span>
        <span className="flex items-center gap-1.5">
          <Recycle className="h-3 w-3 text-sky-400" /> Reusable offcut (≥ {formatFeetInches(plan.settings.minReusableOffcutIn)})
        </span>
        <span className="flex items-center gap-1.5">
          <Trash2 className="h-3 w-3 text-amber-400" /> Scrap
        </span>
        <span>Saw cut allowance {plan.settings.kerfIn}&quot; per cut is counted as scrap.</span>
      </div>
    </div>
  );
}
