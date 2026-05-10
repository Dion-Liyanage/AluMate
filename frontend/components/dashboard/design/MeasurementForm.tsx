"use client";

import { productMeasurements, MeasurementField } from "./quotationConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeasurementFormProps {
  productType: string;
  values: Record<string, number | string>;
  onChange: (key: string, value: number | string) => void;
}

export function MeasurementForm({ productType, values, onChange }: MeasurementFormProps) {
  const fields = productMeasurements[productType] || productMeasurements.other;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Measurements
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field: MeasurementField) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-xs text-zinc-400">
              {field.label}
              {field.unit && (
                <span className="ml-1 text-zinc-600">({field.unit})</span>
              )}
            </Label>

            {field.type === "select" ? (
              <select
                value={values[field.key] || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="" className="bg-zinc-900">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900">
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="number"
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                value={values[field.key] || ""}
                onChange={(e) =>
                  onChange(field.key, e.target.value ? Number(e.target.value) : "")
                }
                className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
