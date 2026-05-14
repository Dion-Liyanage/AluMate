"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateEstimate, EstimationResult } from "./quotationConfig";
import { Calculator, AlertTriangle, TrendingUp, Sparkles, RefreshCcw, History, Tag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveEstimatePanelProps {
  productType: string;
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
  color: string;
  accessories: string[];
}

function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LiveEstimatePanel({
  productType,
  measurements,
  purpose,
  environment,
  strength,
  color,
  accessories,
}: LiveEstimatePanelProps) {
  const [isCalculated, setIsCalculated] = useState(false);
  const [lastGeneratedEstimate, setLastGeneratedEstimate] = useState<EstimationResult | null>(null);
  
  const isInitialMount = useRef(true);

  const currentEstimate: EstimationResult = useMemo(
    () =>
      calculateEstimate({
        productType,
        measurements,
        purpose,
        environment,
        strength,
        color,
        accessories,
      }),
    [productType, measurements, purpose, environment, strength, color, accessories]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsCalculated(false);
  }, [productType, measurements, purpose, environment, strength, color, accessories]);

  const hasRequiredInput =
    Object.values(measurements).some((v) => !!v) &&
    purpose &&
    strength &&
    color;

  const handleCalculate = () => {
    setIsCalculated(true);
    setLastGeneratedEstimate(currentEstimate);
  };

  const showStalePrice = !isCalculated && lastGeneratedEstimate !== null;
  const showInitialPrompt = !isCalculated && lastGeneratedEstimate === null;
  const showCurrentPrice = isCalculated && lastGeneratedEstimate !== null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Calculator className="h-3.5 w-3.5" />
        Estimation
      </h4>

      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4 space-y-4">
        {showInitialPrompt && (
          <div className="text-center py-4 space-y-4">
            <div className="flex justify-center">
              <TrendingUp className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">
              {hasRequiredInput
                ? "Ready to calculate your estimated cost based on current configuration."
                : "Fill all required fields above to unlock estimation."}
            </p>
            <Button
              onClick={handleCalculate}
              disabled={!hasRequiredInput}
              className={`w-full gap-2 transition-all duration-300 ${
                hasRequiredInput
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/40"
                  : "bg-zinc-800 text-zinc-600 border-zinc-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Generate Price Estimate
            </Button>
          </div>
        )}

        {(showCurrentPrice || showStalePrice) && (
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
              {/* Profile info */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  Labor Rate
                </span>
                <span className="text-sm font-medium text-violet-300">
                  {formatLKR(lastGeneratedEstimate?.recommendedProfile.laborRatePerSqFt || 0)} / sqft
                </span>
              </div>

              <div className="h-px bg-zinc-800" />

              {/* Material Details */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Package className="h-3 w-3" />
                      Profile
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 leading-tight">
                        {lastGeneratedEstimate?.recommendedProfile.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {lastGeneratedEstimate?.recommendedProfile.thickness} Thickness
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Finish
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 capitalize leading-tight">
                        {color.replace("-", " ")}
                      </p>
                      <p className="text-[11px] text-zinc-500 capitalize">
                        {strength} Duty
                      </p>
                    </div>
                  </div>
                </div>

                {lastGeneratedEstimate?.explanation && lastGeneratedEstimate.explanation.length > 0 && (
                  <div className="bg-zinc-800/30 rounded-lg p-2.5 border border-zinc-800/50">
                    <ul className="space-y-1.5">
                      {lastGeneratedEstimate.explanation.map((exp, i) => (
                        <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5 leading-normal">
                          <div className="h-1 w-1 rounded-full bg-violet-500/50 mt-1.5 shrink-0" />
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="h-px bg-zinc-800" />

              {/* Cost breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Estimated Material</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {formatLKR(lastGeneratedEstimate?.materialCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Estimated Labor</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {formatLKR(lastGeneratedEstimate?.laborCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Estimated Installation</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {formatLKR(lastGeneratedEstimate?.installationCost || 0)}
                  </span>
                </div>
                {(lastGeneratedEstimate?.accessoriesCost || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Accessories</span>
                    <span className="text-sm font-medium text-zinc-200">
                      {formatLKR(lastGeneratedEstimate?.accessoriesCost || 0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-px bg-zinc-800" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-zinc-200">
                  Estimated Cost Range
                </span>
                <span className={`text-xl font-bold ${showStalePrice ? "text-zinc-500" : "bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent"}`}>
                  {formatLKR((lastGeneratedEstimate?.total || 0) * 0.9)} - {formatLKR((lastGeneratedEstimate?.total || 0) * 1.15)}
                </span>
              </div>
            </div>

            {showStalePrice && (
              <Button
                onClick={handleCalculate}
                disabled={!hasRequiredInput}
                className="w-full gap-2 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all py-6 text-sm font-semibold"
              >
                <RefreshCcw className="h-4 w-4" />
                Update Price Estimate
              </Button>
            )}
          </div>
        )}

        {/* Warning */}
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
