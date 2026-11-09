"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
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
import { sustainabilityApi } from "@/lib/api";

interface RecordMaterialUsageDialogProps {
  onSaved: () => void;
}

const initialForm = {
  projectName: "",
  purchasedKg: "",
  usedKg: "",
  reusableOffcutsKg: "",
  scrapWasteKg: "",
  totalCost: "",
};

export function RecordMaterialUsageDialog({ onSaved }: RecordMaterialUsageDialogProps) {
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

    if (!form.projectName.trim()) {
      toast.error("Enter a project name");
      return;
    }

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
      await sustainabilityApi.recordMaterialUsage({
        projectName: form.projectName.trim(),
        purchasedKg,
        usedKg,
        reusableOffcutsKg,
        scrapWasteKg,
        totalCost,
      });
      toast.success("Material usage recorded");
      setForm(initialForm);
      setIsOpen(false);
      onSaved();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save material usage";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25">
          <PackageCheck className="mr-2 h-4 w-4" />
          Add Historical Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Add Historical Material Record</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Use this only to add a past job that was not recorded through the order workflow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              required
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="e.g. Colombo Office Partition"
              className="border-zinc-800 bg-zinc-900"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Aluminium purchased (kg)" field="purchasedKg" form={form} onChange={updateField} />
            <NumberField label="Aluminium used (kg)" field="usedKg" form={form} onChange={updateField} />
            <NumberField label="Reusable offcuts (kg)" field="reusableOffcutsKg" form={form} onChange={updateField} />
            <NumberField label="Scrap waste (kg)" field="scrapWasteKg" form={form} onChange={updateField} />
            <NumberField label="Total aluminium cost (Rs.)" field="totalCost" form={form} onChange={updateField} />
            <AutoCostPerKg purchasedKg={form.purchasedKg} totalCost={form.totalCost} />
          </div>
          <p className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-400">
            AluMate calculates cost per kg from total aluminium cost ÷ purchased kilograms, then estimates savings from reusable offcuts.
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-100">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              {isSaving ? "Saving..." : "Save Record"}
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
      <Label htmlFor="historicalCalculatedCostPerKg">Cost per kg (Rs.)</Label>
      <Input
        id="historicalCalculatedCostPerKg"
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
