"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminMaterialsApi, type ProfileInput } from "@/lib/api";
import { PROFILE_SHAPES, type MaterialProfile, type ProfileShape } from "@/types";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Profile to edit; omit to create a new one. */
  profile?: MaterialProfile | null;
  existingSeries: string[];
  onSaved: () => void;
}

type FormState = Record<
  "code" | "name" | "series" | "thicknessMm" | "weightKgPerM" | "barLengthFt" | "shorterLengthsFt" | "pricePerFt",
  string
> & { shape: ProfileShape; isActive: boolean };

/** "7, 14" → [7, 14]; null if any entry isn't a positive number. */
const parseLengths = (text: string): number[] | null => {
  const parts = text.split(/[,\s]+/).filter(Boolean);
  const numbers = parts.map(Number);
  if (numbers.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  return [...new Set(numbers)].sort((a, b) => a - b);
};

const emptyForm: FormState = {
  code: "",
  name: "",
  series: "",
  shape: "frame",
  thicknessMm: "",
  weightKgPerM: "",
  barLengthFt: "20",
  shorterLengthsFt: "",
  pricePerFt: "",
  isActive: true,
};

const toForm = (profile: MaterialProfile): FormState => ({
  code: profile.code,
  name: profile.name,
  series: profile.series,
  shape: profile.shape,
  thicknessMm: String(profile.thicknessMm),
  weightKgPerM: String(profile.weightKgPerM),
  barLengthFt: String(profile.barLengthFt),
  shorterLengthsFt: (profile.shorterLengthsFt ?? []).join(", "),
  pricePerFt: String(profile.pricePerFt),
  isActive: profile.isActive,
});

export function ProfileDialog({ open, onOpenChange, profile, existingSeries, onSaved }: ProfileDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!profile;

  useEffect(() => {
    if (open) setForm(profile ? toForm(profile) : emptyForm);
  }, [open, profile]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const barLengthFt = Number(form.barLengthFt);
    const shorterLengthsFt = parseLengths(form.shorterLengthsFt);
    if (shorterLengthsFt === null) {
      toast.error("Shorter lengths must be numbers in feet, separated by commas (e.g. 7, 14)");
      return;
    }
    const tooLong = shorterLengthsFt.filter((length) => length >= barLengthFt);
    if (tooLong.length) {
      toast.error(`Shorter lengths must be less than the ${barLengthFt} ft bar (got ${tooLong.join(", ")} ft)`);
      return;
    }

    const payload: ProfileInput = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      series: form.series.trim(),
      shape: form.shape,
      thicknessMm: Number(form.thicknessMm),
      weightKgPerM: Number(form.weightKgPerM),
      barLengthFt,
      shorterLengthsFt,
      pricePerFt: Number(form.pricePerFt),
      isActive: form.isActive,
    };

    setIsSaving(true);
    try {
      if (profile) await adminMaterialsApi.updateProfile(profile._id, payload);
      else await adminMaterialsApi.createProfile(payload);
      toast.success(isEditing ? "Profile updated" : "Profile added");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const numberField = (key: keyof FormState, label: string, step: string, min = "0") => (
    <div className="space-y-1.5">
      <Label htmlFor={`profile-${key}`} className="text-xs text-zinc-400">
        {label}
      </Label>
      <Input
        id={`profile-${key}`}
        type="number"
        required
        min={min}
        step={step}
        value={form[key] as string}
        onChange={(event) => update(key, event.target.value as never)}
        className="bg-zinc-900 border-zinc-800"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${profile.code}` : "Add Aluminium Profile"}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Use the values from your supplier&apos;s profile catalogue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-code" className="text-xs text-zinc-400">Profile code</Label>
              <Input
                id="profile-code"
                required
                placeholder="e.g. SW70-TRK"
                value={form.code}
                onChange={(event) => update("code", event.target.value.toUpperCase())}
                className="bg-zinc-900 border-zinc-800 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-shape" className="text-xs text-zinc-400">Shape / role</Label>
              <Select value={form.shape} onValueChange={(value) => update("shape", value as ProfileShape)}>
                <SelectTrigger id="profile-shape" className="bg-zinc-900 border-zinc-800 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {PROFILE_SHAPES.map((shape) => (
                    <SelectItem key={shape} value={shape} className="capitalize">
                      {shape}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs text-zinc-400">Name</Label>
            <Input
              id="profile-name"
              required
              placeholder="e.g. Sliding Track Frame"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-series" className="text-xs text-zinc-400">Series / system</Label>
            <Input
              id="profile-series"
              required
              list="profile-series-options"
              placeholder="e.g. 70mm Sliding Window"
              value={form.series}
              onChange={(event) => update("series", event.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
            <datalist id="profile-series-options">
              {existingSeries.map((series) => (
                <option key={series} value={series} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {numberField("thicknessMm", "Wall thickness (mm)", "0.1")}
            {numberField("weightKgPerM", "Weight (kg per metre)", "0.001")}
            {numberField("barLengthFt", "Stock bar length (ft)", "0.5", "1")}
            {numberField("pricePerFt", "Price per ft (LKR)", "1")}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-shorterLengthsFt" className="text-xs text-zinc-400">
              Also sold as shorter pieces (ft) — optional
            </Label>
            <Input
              id="profile-shorterLengthsFt"
              placeholder="e.g. 7, 14"
              value={form.shorterLengthsFt}
              onChange={(event) => update("shorterLengthsFt", event.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
            <p className="text-[11px] text-zinc-500">
              Lengths the supplier cuts from the full bar. The cutting plan buys the shortest piece that fits.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
            <div>
              <p className="text-sm text-zinc-200">Available for new quotations</p>
              <p className="text-[11px] text-zinc-500">Inactive profiles block templates that use them.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => update("isActive", !form.isActive)}
              className={
                form.isActive
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }
            >
              {form.isActive ? "Active" : "Inactive"}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-sky-500/20 text-white border border-sky-500/40 hover:bg-sky-500/30"
            >
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
