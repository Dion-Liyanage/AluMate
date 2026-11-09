"use client";

import { useState } from "react";
import { Factory, Leaf, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminOrdersApi } from "@/lib/api";
import type { CuttingPlan } from "@/types";

interface CompleteFabricationDialogProps {
  orderId: string;
  orderNumber: string;
  productType: string;
  /** Cutting plan for the order — pre-fills the form with the planned figures. */
  plan?: CuttingPlan | null;
  onCompleted: () => void;
}

const initialForm = {
  purchasedKg: "",
  usedKg: "",
  reusableOffcutsKg: "",
  scrapWasteKg: "",
  totalCost: "",
};

type FormField = keyof typeof initialForm;

const formFromPlan = (plan: CuttingPlan): typeof initialForm => ({
  purchasedKg: String(Number(plan.totals.purchasedKg.toFixed(2))),
  usedKg: String(Number(plan.totals.usedKg.toFixed(2))),
  reusableOffcutsKg: String(Number(plan.totals.reusableOffcutsKg.toFixed(2))),
  scrapWasteKg: String(Number(plan.totals.scrapWasteKg.toFixed(2))),
  totalCost: String(plan.totals.purchaseCost),
});

export function CompleteFabricationDialog({
  orderId,
  orderNumber,
  productType,
  plan,
  onCompleted,
}: CompleteFabricationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const plannedForm = plan ? formFromPlan(plan) : null;
  const matchesPlan = !!plannedForm && (Object.keys(initialForm) as FormField[]).every(
    (field) => Number(form[field]) === Number(plannedForm[field])
  );

  const handleOpenChange = (open: boolean) => {
    // Start from the plan so the admin only confirms or corrects the figures.
    if (open && plannedForm && Object.values(form).every((value) => value === "")) {
      setForm(plannedForm);
    }
    setIsOpen(open);
  };

  const updateField = (field: FormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const purchasedKg = Number(form.purchasedKg);
    const usedKg = Number(form.usedKg);
    const reusableOffcutsKg = Number(form.reusableOffcutsKg);
    const scrapWasteKg = Number(form.scrapWasteKg);
    const totalCost = Number(form.totalCost);

    if ([purchasedKg, usedKg, reusableOffcutsKg, scrapWasteKg, totalCost].some(Number.isNaN)) {
      toast.error("Enter a valid value for every material field");
      return;
    }

    if (usedKg + reusableOffcutsKg + scrapWasteKg > purchasedKg + 0.001) {
      toast.error("Used, reusable, and scrap material cannot exceed purchased material");
      return;
    }

    setIsSaving(true);
    try {
      const response = await adminOrdersApi.completeFabrication(orderId, {
        purchasedKg,
        usedKg,
        reusableOffcutsKg,
        scrapWasteKg,
        totalCost,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to complete fabrication");
      }

      toast.success("Fabrication completed and material usage recorded");
      setForm(initialForm);
      setIsOpen(false);
      onCompleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete fabrication");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 font-bold px-6 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Factory className="mr-2 h-5 w-5" />
          Complete Fabrication
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Complete Fabrication</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Record the actual material usage before marking this order as fabrication completed.
          </DialogDescription>
        </DialogHeader>

        {plannedForm ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200/90">
            <p className="flex gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>
                Pre-filled from the cutting plan ({plan!.totals.bars} bars, {plan!.totals.efficiencyPct}% efficiency).
                Confirm the figures, or correct any that differ from what actually happened in the workshop.
              </span>
            </p>
            {!matchesPlan && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setForm(plannedForm)}
                className="h-7 shrink-0 gap-1 px-2 text-[11px] text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset to plan
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
            This order has no saved cut list, so enter the material figures manually.
          </div>
        )}

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
          <p className="font-semibold text-zinc-100">{orderNumber}</p>
          <p className="text-zinc-400">{productType}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Aluminium purchased (kg)" field="purchasedKg" form={form} planned={plannedForm?.purchasedKg} onChange={updateField} />
            <NumberField label="Aluminium used (kg)" field="usedKg" form={form} planned={plannedForm?.usedKg} onChange={updateField} />
            <NumberField label="Reusable offcuts (kg)" field="reusableOffcutsKg" form={form} planned={plannedForm?.reusableOffcutsKg} onChange={updateField} />
            <NumberField label="Scrap waste (kg)" field="scrapWasteKg" form={form} planned={plannedForm?.scrapWasteKg} onChange={updateField} />
            <NumberField label="Total aluminium cost (Rs.)" field="totalCost" form={form} planned={plannedForm?.totalCost} onChange={updateField} />
            <AutoCostPerKg purchasedKg={form.purchasedKg} totalCost={form.totalCost} />
          </div>

          <div className="flex gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-400">
            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            Cost per kg is calculated automatically from total aluminium cost ÷ purchased kilograms.
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-100">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              {isSaving ? "Saving..." : "Save & Complete Fabrication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AutoCostPerKg({ purchasedKg, totalCost }: { purchasedKg: string; totalCost: string }) {
  const purchased = Number(purchasedKg);
  const total = Number(totalCost);
  const costPerKg = purchased > 0 && Number.isFinite(total) ? total / purchased : null;

  return (
    <div className="space-y-2">
      <Label htmlFor="calculatedCostPerKg">Cost per kg (Rs.)</Label>
      <Input
        id="calculatedCostPerKg"
        readOnly
        value={costPerKg === null ? "" : costPerKg.toFixed(2)}
        placeholder="Calculated automatically"
        className="border-zinc-800 bg-zinc-800/60 text-zinc-300"
      />
    </div>
  );
}

function NumberField({
  label,
  field,
  form,
  planned,
  onChange,
}: {
  label: string;
  field: FormField;
  form: typeof initialForm;
  planned?: string;
  onChange: (field: FormField, value: string) => void;
}) {
  const differs = planned !== undefined && form[field] !== "" && Number(form[field]) !== Number(planned);
  return (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type="number"
        min="0"
        step="0.01"
        required
        value={form[field]}
        onChange={(event) => onChange(field, event.target.value)}
        className={`bg-zinc-900 ${differs ? "border-amber-500/50" : "border-zinc-800"}`}
      />
      {planned !== undefined && (
        <p className={`text-[10px] ${differs ? "text-amber-300" : "text-zinc-500"}`}>
          Planned: {Number(planned).toLocaleString()}
          {differs ? " — changed" : ""}
        </p>
      )}
    </div>
  );
}
