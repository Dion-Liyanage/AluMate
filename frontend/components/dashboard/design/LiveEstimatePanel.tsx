"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Calculator, History, Loader2, RefreshCcw, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BomPreview } from "@/components/materials/BomPreview";
import { materialsApi } from "@/lib/api";
import type { StudioFeatures } from "@/lib/studio-features";
import { formatLKR } from "@/lib/units";
import type { BomResult } from "@/types";
import { calculateEstimate, isBomProduct } from "./quotationConfig";

interface LiveEstimatePanelProps {
  productType: string;
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
  color: string;
  accessories: string[];
  /** Window/door opening system — required for material-based estimates. */
  systemType?: string;
  studioFeatures?: StudioFeatures;
}

interface DisplayEstimate {
  materialCost: number;
  laborCost: number;
  total: number;
  explanation: string[];
  bom?: BomResult;
}

export function LiveEstimatePanel({
  productType,
  measurements,
  purpose,
  environment,
  strength,
  color,
  accessories,
  systemType,
  studioFeatures,
}: LiveEstimatePanelProps) {
  const usesBom = isBomProduct(productType);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEstimate, setLastEstimate] = useState<DisplayEstimate | null>(null);

  const inputKey = useMemo(
    () =>
      JSON.stringify({
        productType,
        measurements,
        purpose,
        environment,
        strength,
        color,
        accessories,
        systemType,
        studioFeatures,
      }),
    [productType, measurements, purpose, environment, strength, color, accessories, systemType, studioFeatures]
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsCalculated(false);
    setError(null);
  }, [inputKey]);

  const hasRequiredInput =
    Object.values(measurements).some((v) => !!v) && !!color && (!usesBom || !!systemType);

  const handleCalculate = async () => {
    setError(null);

    if (!usesBom) {
      setLastEstimate(
        calculateEstimate({ productType, measurements, purpose, environment, strength, color, accessories })
      );
      setIsCalculated(true);
      return;
    }

    setIsCalculating(true);
    try {
      const response = await materialsApi.estimate({
        productType,
        systemType: systemType!,
        measurements,
        panels: measurements.panelCount ? Number(measurements.panelCount) : undefined,
        verticalBars: studioFeatures?.verticalBars,
        horizontalBars: studioFeatures?.horizontalBars,
        color,
      });
      const bom = response.data;
      if (!bom) throw new Error(response.message || "Unable to calculate materials");

      setLastEstimate({
        materialCost: bom.totals.materialCost + bom.totals.finishSurcharge,
        laborCost: bom.totals.laborCost,
        total: bom.totals.total,
        explanation: bom.explanation,
        bom,
      });
      setIsCalculated(true);
    } catch (estimateError) {
      setError(estimateError instanceof Error ? estimateError.message : "Unable to calculate materials");
    } finally {
      setIsCalculating(false);
    }
  };

  const showStalePrice = !isCalculated && lastEstimate !== null;
  const showInitialPrompt = !isCalculated && lastEstimate === null;
  const showCurrentPrice = isCalculated && lastEstimate !== null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Calculator className="h-3.5 w-3.5" />
        Estimation
      </h4>

      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4 space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {showInitialPrompt && (
          <div className="text-center py-4 space-y-4">
            <div className="flex justify-center">
              <TrendingUp className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-xs text-zinc-500 max-w-[220px] mx-auto">
              {hasRequiredInput
                ? usesBom
                  ? "Ready to calculate the aluminium needed and the cost for your design."
                  : "Ready to calculate your estimated cost based on current configuration."
                : "Fill all required fields above to unlock estimation."}
            </p>
            <Button
              onClick={handleCalculate}
              disabled={!hasRequiredInput || isCalculating}
              className={`w-full gap-2 transition-all duration-300 ${
                hasRequiredInput
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/40"
                  : "bg-zinc-800 text-zinc-600 border-zinc-700"
              }`}
            >
              {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Price Estimate
            </Button>
          </div>
        )}

        {(showCurrentPrice || showStalePrice) && lastEstimate && (
          <div className={`space-y-4 transition-opacity duration-300 ${showStalePrice ? "opacity-60" : "opacity-100"}`}>
            {showStalePrice && (
              <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit mx-auto">
                <History className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-wider">
                  Outdated Estimate
                </span>
              </div>
            )}

            <div className="space-y-4">
              {lastEstimate.bom && <BomPreview bom={lastEstimate.bom} compact />}

              {lastEstimate.explanation.length > 0 && (
                <div className="bg-zinc-800/30 rounded-lg p-2.5 border border-zinc-800/50">
                  <ul className="space-y-1.5">
                    {lastEstimate.explanation.map((exp, i) => (
                      <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5 leading-normal">
                        <div className="h-1 w-1 rounded-full bg-violet-500/50 mt-1.5 shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="h-px bg-zinc-800" />

              {/* Range only — an exact material/labour split would contradict the range. */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-200">Estimated Cost Range</p>
                <p
                  className={`text-xl font-bold whitespace-nowrap ${
                    showStalePrice ? "text-zinc-500" : "bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent"
                  }`}
                >
                  {formatLKR(lastEstimate.total * 0.9)} – {formatLKR(lastEstimate.total * 1.15)}
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Includes aluminium, glass, hardware and labour. Your final price is confirmed after our team
                  reviews your request.
                </p>
              </div>
            </div>

            {showStalePrice && (
              <Button
                onClick={handleCalculate}
                disabled={!hasRequiredInput || isCalculating}
                className="w-full gap-2 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all py-6 text-sm font-semibold"
              >
                {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Update Price Estimate
              </Button>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-400/80">
            This is a preliminary estimate range based on standard specifications. The final quotation will be calculated and verified by our fabrication experts upon your request.
          </p>
        </div>
      </div>
    </div>
  );
}
