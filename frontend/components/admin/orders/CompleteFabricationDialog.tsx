"use client";

import { useState } from "react";
import { Factory, Leaf } from "lucide-react";
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

interface CompleteFabricationDialogProps {
  orderId: string;
  orderNumber: string;
  productType: string;
  onCompleted: () => void;
}

const initialForm = {
  purchasedKg: "",
  usedKg: "",
  reusableOffcutsKg: "",
  scrapWasteKg: "",
  totalCost: "",
};

export function CompleteFabricationDialog({
  orderId,
  orderNumber,
  productType,
  onCompleted,
}: CompleteFabricationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof initialForm, value: string) => {
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

    if (usedKg + reusableOffcutsKg + scrapWasteKg > purchasedKg) {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
          <p className="font-semibold text-zinc-100">{orderNumber}</p>
          <p className="text-zinc-400">{productType}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Aluminium purchased (kg)" field="purchasedKg" form={form} onChange={updateField} />
            <NumberField label="Aluminium used (kg)" field="usedKg" form={form} onChange={updateField} />
            <NumberField label="Reusable offcuts (kg)" field="reusableOffcutsKg" form={form} onChange={updateField} />
            <NumberField label="Scrap waste (kg)" field="scrapWasteKg" form={form} onChange={updateField} />
            <NumberField label="Total aluminium cost (Rs.)" field="totalCost" form={form} onChange={updateField} />
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
  onChange,
}: {
  label: string;
  field: keyof typeof initialForm;
  form: typeof initialForm;
  onChange: (field: keyof typeof initialForm, value: string) => void;
}) {
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
        className="border-zinc-800 bg-zinc-900"
      />
    </div>
  );
}
