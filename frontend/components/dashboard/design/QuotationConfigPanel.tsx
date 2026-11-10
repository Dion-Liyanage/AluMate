"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  CheckCircle2,
  StickyNote,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { MeasurementForm } from "./MeasurementForm";
import { ColorSelector } from "./ColorSelector";
import {
  calculateEstimate,
  getRoundedFeet,
  isBomProduct,
  productMeasurements,
  systemTypeLabels,
} from "./quotationConfig";
import { materialsApi, ordersApi } from "@/lib/api";
import { extractStudioFeatures } from "@/lib/studio-features";
import type { OpeningSystem } from "@/types";
import { LiveEstimatePanel } from "./LiveEstimatePanel";

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
  /**
   * Opening system of a catalogue design (sliding | swing | fixed). Catalogue
   * designs never ask the customer — the system comes from the design itself.
   */
  systemType?: string;
  /** Fixed number of panels of a catalogue design (set by the admin). */
  panelCount?: number;
}

interface QuotationState {
  measurements: Record<string, number | string>;
  purpose: string;
  strength: string;
  color: string;
  customColor: string;
  accessories: string[];
  additionalNotes: string;
}

const initialState: QuotationState = {
  measurements: {},
  purpose: "Standard Family Usage",
  strength: "medium",
  color: "",
  customColor: "",
  accessories: [],
  additionalNotes: "",
};

type SectionId =
  | "system"
  | "measurements"
  | "color"
  | "notes";

const BASE_SECTIONS: SectionId[] = ["measurements", "color", "notes"];

// Collapsible section wrapper
function ConfigSection({
  title,
  isOpen,
  onToggle,
  children,
  isCompleted,
  isValid,
  showNext,
  onNext,
  nextLabel = "Next Step",
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isCompleted?: boolean;
  isValid?: boolean;
  showNext?: boolean;
  onNext?: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="border-b border-zinc-800/50 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between py-3 text-sm font-semibold transition-colors ${
          isOpen ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <span className="flex items-center gap-2">
          {title}
          {!isOpen && isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 space-y-4">
              {children}
              
              {showNext && (
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext?.();
                    }}
                    disabled={!isValid}
                    size="sm"
                    className={`gap-1.5 transition-all ${
                      isValid 
                        ? "bg-zinc-950/90 text-violet-300 border border-violet-500/30 shadow-[0_0_14px_rgba(139,92,246,0.12)] hover:bg-violet-500/10 hover:border-violet-400/50 hover:text-violet-200" 
                        : "bg-zinc-800 text-zinc-500 border-zinc-700 opacity-50"
                    }`}
                  >
                    {nextLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
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
  systemType: catalogueSystemType,
  panelCount: cataloguePanelCount,
}: QuotationConfigPanelProps) {
  const usesBom = isBomProduct(productType);
  const isCatalogue = !!catalogueDesignId;
  // Only custom (studio) designs ask the customer to choose an opening system.
  const showSystemStep = usesBom && !isCatalogue;
  const sections: SectionId[] = useMemo(
    () => (showSystemStep ? ["system", ...BASE_SECTIONS] : BASE_SECTIONS),
    [showSystemStep]
  );

  const [config, setConfig] = useState<QuotationState>(initialState);
  const [activeSection, setActiveSection] = useState<SectionId | null>(sections[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ---------- Opening system (windows & doors) ----------
  const [systems, setSystems] = useState<OpeningSystem[]>([]);
  const [systemsLoading, setSystemsLoading] = useState(usesBom);
  const [systemType, setSystemType] = useState<string>("");

  const studioFeatures = useMemo(() => extractStudioFeatures(designData), [designData]);

  useEffect(() => {
    if (!usesBom) return;
    let cancelled = false;
    setSystemsLoading(true);
    materialsApi
      .getSystems(productType)
      .then((response) => {
        if (!cancelled) setSystems(response.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setSystems([]);
      })
      .finally(() => {
        if (!cancelled) setSystemsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productType, usesBom]);

  // Catalogue designs: use the design's system. Older designs saved before
  // systems existed fall back to sliding (or the first available system).
  useEffect(() => {
    if (!isCatalogue || !usesBom || systems.length === 0) return;
    const resolved =
      systems.find((system) => system.systemType === catalogueSystemType) ??
      systems.find((system) => system.systemType === "sliding") ??
      systems[0];
    setSystemType(resolved.systemType);
  }, [isCatalogue, usesBom, systems, catalogueSystemType]);

  const selectedSystem = systems.find((system) => system.systemType === systemType);

  // Customers don't choose the number of panels — it comes from the design:
  // - catalogue designs: the fixed count set by the admin on the design
  // - studio sliding designs: each vertical bar separates two sashes
  // Otherwise the opening system's default is used.
  const defaultPanels = useMemo(() => {
    if (!selectedSystem) return undefined;
    let panels = selectedSystem.defaultPanels;
    if (isCatalogue && cataloguePanelCount) {
      panels = cataloguePanelCount;
    } else if (selectedSystem.systemType === "sliding" && studioFeatures?.verticalBars) {
      panels = studioFeatures.verticalBars + 1;
    }
    return Math.min(selectedSystem.maxPanels, Math.max(selectedSystem.minPanels, panels));
  }, [selectedSystem, studioFeatures, isCatalogue, cataloguePanelCount]);

  // Reset panels whenever the system (and so its default) changes.
  useEffect(() => {
    if (defaultPanels === undefined) return;
    setConfig((prev) => ({ ...prev, measurements: { ...prev.measurements, panelCount: defaultPanels } }));
  }, [defaultPanels]);

  // Bars drawn in the studio become mullions/transoms — except on sliding
  // systems, where vertical bars are the sash meeting points (panels).
  const bomStudioFeatures = useMemo(() => {
    if (!studioFeatures) return undefined;
    return systemType === "sliding" ? { ...studioFeatures, verticalBars: 0 } : studioFeatures;
  }, [studioFeatures, systemType]);

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

  // Validation & Completion logic
  const { sectionValidations, sectionCompletions } = useMemo(() => {
    const requiredFields = (productMeasurements[productType] || productMeasurements.other).filter(
      (field) => field.key !== "panelCount"
    );
    const measurementsValid = requiredFields.every((f) => {
      const val = config.measurements[f.key];
      if (f.type === "dimension") {
        // Dimension string like "5'2\"" - check if it has any feet or inches
        return !!val && getRoundedFeet(val) > 0;
      }
      return val !== undefined && val !== "" && Number(val) > 0;
    });

    const panels = Number(config.measurements.panelCount);
    const systemValid =
      !usesBom ||
      (!!selectedSystem &&
        Number.isInteger(panels) &&
        panels >= selectedSystem.minPanels &&
        panels <= selectedSystem.maxPanels);

    const validations: Record<SectionId, boolean> = {
      system: systemValid,
      measurements: measurementsValid,
      color: !!config.color,
      notes: true,
    };

    const completions: Record<SectionId, boolean> = {
      system: usesBom && systemValid,
      measurements: measurementsValid,
      color: !!config.color,
      notes: config.additionalNotes.trim().length > 0,
    };

    return { sectionValidations: validations, sectionCompletions: completions };
  }, [config, productType, usesBom, selectedSystem]);

  const handleNext = (currentId: SectionId) => {
    const currentIndex = sections.indexOf(currentId);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  const allRequiredValid =
    sectionValidations.system && sectionValidations.measurements && sectionValidations.color;

  const handleSubmit = async () => {
    if (!allRequiredValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Windows & doors: the server builds the bill of materials and price.
      const estimatedPrice = usesBom
        ? undefined
        : calculateEstimate({
            productType,
            measurements: config.measurements,
            purpose: config.purpose || "",
            environment: "",
            strength: config.strength || "",
            color: config.color || "",
            accessories: config.accessories || [],
          }).total;

      await ordersApi.create({
        productType,
        designType: catalogueDesignId ? "catalogue" : "custom",
        catalogueDesignId,
        measurements: config.measurements,
        purpose: config.purpose,
        strengthCategory: config.strength,
        color: config.color,
        accessories: config.accessories,
        estimatedPrice,
        ...(usesBom && {
          systemType,
          verticalBars: bomStudioFeatures?.verticalBars ?? 0,
          horizontalBars: bomStudioFeatures?.horizontalBars ?? 0,
        }),
        notes: config.additionalNotes ? [{ message: config.additionalNotes, createdBy: "Customer" }] : [],
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quotation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit quotation. Please try again.");
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
          Your request has been successfully forwarded to our experts. They will review your measurements and preferences, perform technical calculations, and generate your official final quotation shortly.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            // Catalogue designs keep their system, so keep its panel default too.
            setConfig({
              ...initialState,
              measurements: isCatalogue && defaultPanels ? { panelCount: defaultPanels } : {},
            });
            if (!isCatalogue) setSystemType("");
            setActiveSection(sections[0]);
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
        {isCatalogue && usesBom && !systemsLoading && !selectedSystem && (
          <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-300">
            Online pricing for this design is unavailable right now. Please contact us for a quotation.
          </p>
        )}

        {showSystemStep && (
          <ConfigSection
            title="🪟 Opening System"
            isOpen={activeSection === "system"}
            onToggle={() => setActiveSection(activeSection === "system" ? null : "system")}
            isCompleted={sectionCompletions.system}
            isValid={sectionValidations.system}
            showNext={true}
            onNext={() => handleNext("system")}
          >
            <OpeningSystemSelector
              systems={systems}
              isLoading={systemsLoading}
              value={systemType}
              onChange={setSystemType}
              studioFeatures={studioFeatures}
              productType={productType}
            />
          </ConfigSection>
        )}

        <ConfigSection 
          title="📐 Measurements" 
          isOpen={activeSection === "measurements"}
          onToggle={() => setActiveSection(activeSection === "measurements" ? null : "measurements")}
          isCompleted={sectionCompletions.measurements}
          isValid={sectionValidations.measurements}
          showNext={true}
          onNext={() => handleNext("measurements")}
        >
          <MeasurementForm
            productType={productType}
            values={config.measurements}
            onChange={updateMeasurement}
          />
        </ConfigSection>

        {/* Purpose, Strength removed - keeping only Measurements, Color, Notes */}

        <ConfigSection 
          title="🎨 Color & Finish" 
          isOpen={activeSection === "color"}
          onToggle={() => setActiveSection(activeSection === "color" ? null : "color")}
          isCompleted={sectionCompletions.color}
          isValid={sectionValidations.color}
          showNext={true}
          onNext={() => handleNext("color")}
        >
          <ColorSelector
            value={config.color}
            customColor={config.customColor}
            onChange={(v) => updateConfig("color", v)}
            onCustomColorChange={(v) => updateConfig("customColor", v)}
          />
        </ConfigSection>

        {/* Recommended materials removed */}

        <ConfigSection 
          title="📝 Additional Notes" 
          isOpen={activeSection === "notes"}
          onToggle={() => setActiveSection(activeSection === "notes" ? null : "notes")}
          isCompleted={sectionCompletions.notes}
          isValid={sectionValidations.notes}
          showNext={false}
        >
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
            environment=""
            strength={config.strength}
            color={config.color}
            accessories={config.accessories}
            systemType={usesBom ? systemType : undefined}
            studioFeatures={bomStudioFeatures}
          />
        </div>
      </div>

      {/* Sticky submit button */}
      <div className="border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-5 py-4">
        <Button
          onClick={handleSubmit}
          disabled={!allRequiredValid || isSubmitting}
          className={`w-full py-3 text-sm font-semibold transition-all duration-300 ${
            allRequiredValid
              ? "bg-linear-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
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
              Request Final Quotation
            </>
          )}
        </Button>
        {!allRequiredValid && (
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            Complete all required sections to submit
          </p>
        )}
      </div>
    </div>
  );
}

function OpeningSystemSelector({
  systems,
  isLoading,
  value,
  onChange,
  studioFeatures,
  productType,
}: {
  systems: OpeningSystem[];
  isLoading: boolean;
  value: string;
  onChange: (systemType: string) => void;
  studioFeatures?: { verticalBars: number; horizontalBars: number };
  productType: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading available systems...
      </div>
    );
  }

  if (systems.length === 0) {
    return (
      <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-300">
        No {productType} systems are available right now. Please contact us for a quotation.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {systems.map((system) => {
          const isSelected = system.systemType === value;
          return (
            <button
              key={system._id}
              type="button"
              onClick={() => onChange(system.systemType)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                isSelected
                  ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                {systemTypeLabels[system.systemType] ?? system.name}
              </span>
              {system.description && (
                <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">{system.description}</span>
              )}
            </button>
          );
        })}
      </div>

      {studioFeatures && (studioFeatures.verticalBars > 0 || studioFeatures.horizontalBars > 0) && (
        <p className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] leading-relaxed text-sky-300/90">
          Your studio design has {studioFeatures.verticalBars} vertical and {studioFeatures.horizontalBars} horizontal
          bar{studioFeatures.horizontalBars === 1 ? "" : "s"}.{" "}
          {value === "sliding"
            ? "Vertical bars set the number of sliding panels; horizontal bars are added as fixed transoms."
            : "They are included in the cut list as mullions and transoms."}
        </p>
      )}
    </div>
  );
}
