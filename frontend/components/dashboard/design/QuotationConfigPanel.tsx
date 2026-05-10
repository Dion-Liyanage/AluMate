"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  CheckCircle2,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { MeasurementForm } from "./MeasurementForm";
import { PurposeSelector } from "./PurposeSelector";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { StrengthSelector } from "./StrengthSelector";
import { ColorSelector } from "./ColorSelector";
import { AccessoriesSelector } from "./AccessoriesSelector";
import { LiveEstimatePanel } from "./LiveEstimatePanel";
import { calculateEstimate } from "./quotationConfig";
import { quotationsApi } from "@/lib/api";

interface QuotationConfigPanelProps {
  productType: string;
  /** Optional design JSON from the design studio */
  designData?: string;
  /** Optional preview image base64 */
  previewImage?: string;
  /** Optional catalogue design ID */
  catalogueDesignId?: string;
  /** Optional catalogue design title */
  catalogueDesignTitle?: string;
}

interface QuotationState {
  measurements: Record<string, number | string>;
  purpose: string;
  environment: string;
  strength: string;
  color: string;
  customColor: string;
  accessories: string[];
  additionalNotes: string;
}

const initialState: QuotationState = {
  measurements: {},
  purpose: "",
  environment: "indoor",
  strength: "",
  color: "silver",
  customColor: "",
  accessories: [],
  additionalNotes: "",
};

// Collapsible section wrapper
function ConfigSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-zinc-300 hover:text-zinc-100 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuotationConfigPanel({
  productType,
  designData,
  previewImage,
  catalogueDesignId,
  catalogueDesignTitle,
}: QuotationConfigPanelProps) {
  const [config, setConfig] = useState<QuotationState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateConfig = useCallback(
    <K extends keyof QuotationState>(key: K, value: QuotationState[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateMeasurement = useCallback((key: string, value: number | string) => {
    setConfig((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value },
    }));
  }, []);

  // Validate required fields
  const isValid =
    Object.values(config.measurements).some((v) => v && Number(v) > 0) &&
    config.purpose &&
    config.strength;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const estimate = calculateEstimate({
        productType,
        measurements: config.measurements,
        purpose: config.purpose,
        environment: config.environment,
        strength: config.strength,
        color: config.color,
        accessories: config.accessories,
      });

      await quotationsApi.request({
        description: [
          `Product: ${productType}`,
          catalogueDesignTitle
            ? `Catalogue Design: ${catalogueDesignTitle}`
            : "Custom Design",
          `Purpose: ${config.purpose}`,
          `Environment: ${config.environment}`,
          `Strength: ${config.strength}`,
          `Color: ${config.color === "custom" ? config.customColor : config.color}`,
          `Accessories: ${config.accessories.join(", ") || "None"}`,
          `Measurements: ${JSON.stringify(config.measurements)}`,
          config.additionalNotes
            ? `Notes: ${config.additionalNotes}`
            : "",
          `Estimated Total: LKR ${estimate.total.toLocaleString()}`,
        ]
          .filter(Boolean)
          .join("\n"),
        material: estimate.materialCategory,
        dimensions: Object.entries(config.measurements)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", "),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quotation:", error);
      alert("Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-2">
          Quotation Request Submitted!
        </h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Your quotation request has been submitted successfully. Our team will review
          your requirements and get back to you with a detailed quotation.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            setConfig(initialState);
          }}
          className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
        >
          Create Another Quotation
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable configuration area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0">
        <ConfigSection title="📐 Measurements" defaultOpen={true}>
          <MeasurementForm
            productType={productType}
            values={config.measurements}
            onChange={updateMeasurement}
          />
        </ConfigSection>

        <ConfigSection title="🎯 Purpose" defaultOpen={true}>
          <PurposeSelector
            productType={productType}
            value={config.purpose}
            onChange={(v) => updateConfig("purpose", v)}
          />
        </ConfigSection>

        <ConfigSection title="🌍 Environment" defaultOpen={false}>
          <EnvironmentSelector
            value={config.environment}
            onChange={(v) => updateConfig("environment", v)}
          />
        </ConfigSection>

        <ConfigSection title="🛡️ Strength" defaultOpen={true}>
          <StrengthSelector
            value={config.strength}
            onChange={(v) => updateConfig("strength", v)}
          />
        </ConfigSection>

        <ConfigSection title="🎨 Color & Finish" defaultOpen={false}>
          <ColorSelector
            value={config.color}
            customColor={config.customColor}
            onChange={(v) => updateConfig("color", v)}
            onCustomColorChange={(v) => updateConfig("customColor", v)}
          />
        </ConfigSection>

        <ConfigSection title="🔩 Accessories" defaultOpen={false}>
          <AccessoriesSelector
            productType={productType}
            selected={config.accessories}
            onChange={(v) => updateConfig("accessories", v)}
          />
        </ConfigSection>

        <ConfigSection title="📝 Additional Notes" defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <StickyNote className="h-3 w-3" />
              Any special requirements or additional information
            </div>
            <Textarea
              placeholder="e.g. Need extra strong glass, specific delivery date, etc."
              value={config.additionalNotes}
              onChange={(e) => updateConfig("additionalNotes", e.target.value)}
              rows={3}
              className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none text-sm"
            />
          </div>
        </ConfigSection>

        {/* Live Estimation */}
        <div className="pt-4">
          <LiveEstimatePanel
            productType={productType}
            measurements={config.measurements}
            purpose={config.purpose}
            environment={config.environment}
            strength={config.strength}
            color={config.color}
            accessories={config.accessories}
          />
        </div>
      </div>

      {/* Sticky submit button */}
      <div className="border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-5 py-4">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`w-full py-3 text-sm font-semibold transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate Quotation Request
            </>
          )}
        </Button>
        {!isValid && (
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            Fill in measurements, purpose, and strength to submit
          </p>
        )}
      </div>
    </div>
  );
}
