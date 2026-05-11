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

  // Helper to parse "5'2\"" into { ft: 5, in: 2 }
  const parseDimension = (val: string | number) => {
    const str = String(val || "");
    const match = str.match(/(\d+)'(?:(\d+)")?/);
    return {
      ft: match ? match[1] : "",
      in: match ? match[2] : "",
    };
  };

  const handleDimensionChange = (key: string, type: "ft" | "in", newVal: string) => {
    const current = parseDimension(values[key]);
    const ft = type === "ft" ? newVal : current.ft;
    const inch = type === "in" ? newVal : current.in;
    
    // Combine into format 5'2"
    if (!ft && !inch) {
      onChange(key, "");
    } else {
      onChange(key, `${ft || 0}'${inch || 0}"`);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Measurements
        <span className="ml-2 text-[10px] font-medium text-amber-400/80 normal-case tracking-normal">
          Required
        </span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field: MeasurementField) => {
          if (field.type === "dimension") {
            const dim = parseDimension(values[field.key]);
            return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{field.label}</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      placeholder="ft"
                      value={dim.ft}
                      onChange={(e) => handleDimensionChange(field.key, "ft", e.target.value)}
                      className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pr-7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">ft</span>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      placeholder="in"
                      min={0}
                      max={11}
                      value={dim.in}
                      onChange={(e) => handleDimensionChange(field.key, "in", e.target.value)}
                      className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pr-7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">in</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs text-zinc-400">
                {field.label}
                {field.unit && <span className="ml-1 text-zinc-600">({field.unit})</span>}
              </Label>
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
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-500 italic mt-2">
        * Any inch input will be rounded up to the next full foot for material calculation.
      </p>
    </div>
  );
}
