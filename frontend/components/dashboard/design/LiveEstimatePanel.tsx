"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateEstimate, EstimationResult } from "./quotationConfig";
import { Calculator, AlertTriangle, TrendingUp } from "lucide-react";

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
  const estimate: EstimationResult = useMemo(
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

  const hasMinimalInput =
    Object.values(measurements).some((v) => v && Number(v) > 0) && strength;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Calculator className="h-3.5 w-3.5" />
        Live Estimation
      </h4>

      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4 space-y-4">
        {!hasMinimalInput ? (
          <div className="text-center py-6">
            <TrendingUp className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              Enter measurements and select strength to see estimation
            </p>
          </div>
        ) : (
          <>
            {/* Material category */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Material Category</span>
              <span className="text-sm font-medium text-violet-300">
                {estimate.materialCategory}
              </span>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Cost breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Estimated Material</span>
                <span className="text-sm font-medium text-zinc-200">
                  {formatLKR(estimate.materialCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Estimated Labor</span>
                <span className="text-sm font-medium text-zinc-200">
                  {formatLKR(estimate.laborCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Estimated Installation</span>
                <span className="text-sm font-medium text-zinc-200">
                  {formatLKR(estimate.installationCost)}
                </span>
              </div>
              {estimate.accessoriesCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Accessories</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {formatLKR(estimate.accessoriesCost)}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Total */}
            <motion.div
              key={estimate.total}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <span className="text-base font-semibold text-zinc-200">
                Estimated Total
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                {formatLKR(estimate.total)}
              </span>
            </motion.div>
          </>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-400/80">
            This is a rough estimate only. The final quotation will be reviewed and
            confirmed by our team.
          </p>
        </div>
      </div>
    </div>
  );
}
