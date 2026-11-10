"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calculator, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SizeBandEditor } from "@/components/admin/materials/SizeBandEditor";
import { BomPreview } from "@/components/materials/BomPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminMaterialsApi, type ProductTemplateInput } from "@/lib/api";
import type { BomResult, MaterialProfile, ProductTemplate, SizeBand, SystemType } from "@/types";

const FORMULA_HELP: [string, string][] = [
  ["W", "overall width (inches)"],
  ["H", "overall height (inches)"],
  ["P", "panels / sashes / leaves"],
  ["MV", "extra vertical bars from the studio design"],
  ["TR", "extra horizontal bars from the studio design"],
];

const newBand = (profileCode = ""): SizeBand => ({
  name: "Standard",
  laborRatePerSqFt: 0,
  glassRatePerSqFt: 0,
  hardwareCostPerPanel: 0,
  lines: [
    { component: "Outer frame – top & bottom", profileCode, quantityFormula: "2", lengthFormula: "W", cutAngle: 45 },
    { component: "Outer frame – sides", profileCode, quantityFormula: "2", lengthFormula: "H", cutAngle: 45 },
  ],
});

/** Only the fields the API accepts (no _id, timestamps, isSample). */
const toInput = (template: ProductTemplateInput): ProductTemplateInput => ({
  productType: template.productType,
  systemType: template.systemType,
  name: template.name,
  description: template.description ?? "",
  minPanels: template.minPanels,
  maxPanels: template.maxPanels,
  defaultPanels: template.defaultPanels,
  isActive: template.isActive,
  sizeBands: template.sizeBands.map((band) => ({
    name: band.name,
    maxWidthFt: band.maxWidthFt ?? null,
    maxHeightFt: band.maxHeightFt ?? null,
    maxAreaSqFt: band.maxAreaSqFt ?? null,
    maxPanelWidthFt: band.maxPanelWidthFt ?? null,
    laborRatePerSqFt: band.laborRatePerSqFt,
    glassRatePerSqFt: band.glassRatePerSqFt,
    hardwareCostPerPanel: band.hardwareCostPerPanel,
    lines: band.lines.map(({ component, profileCode, quantityFormula, lengthFormula, cutAngle }) => ({
      component,
      profileCode,
      quantityFormula,
      lengthFormula,
      cutAngle,
    })),
  })),
});

function TemplateEditor() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = templateId === "new";

  const [profiles, setProfiles] = useState<MaterialProfile[]>([]);
  const [draft, setDraft] = useState<ProductTemplateInput | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profilesResponse, templateResponse] = await Promise.all([
          adminMaterialsApi.getProfiles(),
          isNew ? Promise.resolve(null) : adminMaterialsApi.getTemplate(templateId),
        ]);
        if (cancelled) return;
        const loadedProfiles = profilesResponse.data ?? [];
        setProfiles(loadedProfiles);

        let initial: ProductTemplateInput;
        if (templateResponse?.data) {
          const template = templateResponse.data as ProductTemplate;
          initial = toInput(template);
        } else {
          const productType = searchParams.get("productType") === "door" ? "door" : "window";
          const systemType = (searchParams.get("systemType") ?? "sliding") as SystemType;
          const panels = systemType === "sliding" ? 2 : 1;
          initial = {
            productType,
            systemType,
            name: `${systemType[0].toUpperCase()}${systemType.slice(1)} ${productType === "door" ? "Door" : "Window"}`,
            description: "",
            minPanels: panels,
            maxPanels: systemType === "fixed" ? 1 : panels + 2,
            defaultPanels: panels,
            isActive: true,
            sizeBands: [newBand(loadedProfiles[0]?.code)],
          };
        }
        setDraft(initial);
        setSavedSnapshot(isNew ? "" : JSON.stringify(initial));
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Failed to load template");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, templateId, searchParams]);

  const isDirty = !!draft && JSON.stringify(draft) !== savedSnapshot;

  const update = <K extends keyof ProductTemplateInput>(key: K, value: ProductTemplateInput[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateBands = (updater: (bands: SizeBand[]) => SizeBand[]) =>
    setDraft((prev) => (prev ? { ...prev, sizeBands: updater(prev.sizeBands) } : prev));

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const payload = toInput(draft);
      if (isNew) {
        const response = await adminMaterialsApi.createTemplate(payload);
        toast.success("Template created");
        if (response.data?._id) router.replace(`/admin/materials/templates/${response.data._id}`);
      } else {
        // Product and system type are fixed once a template exists.
        const changes: Partial<ProductTemplateInput> = { ...payload };
        delete changes.productType;
        delete changes.systemType;
        const response = await adminMaterialsApi.updateTemplate(templateId, changes);
        const saved = response.data ? toInput(response.data) : payload;
        setDraft(saved);
        setSavedSnapshot(JSON.stringify(saved));
        toast.success("Template saved");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template", { duration: 8000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await adminMaterialsApi.deleteTemplate(templateId);
      toast.success("Template deleted");
      router.push("/admin/materials/templates");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete template");
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {loadError ?? "Template not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/materials/templates">
            <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">{draft.name || "New template"}</h2>
            <p className="text-sm capitalize text-zinc-500">
              {draft.systemType} {draft.productType}
              {isDirty && <span className="ml-2 normal-case text-sky-400">· unsaved changes</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              variant="outline"
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              className={
                confirmDelete
                  ? "border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-red-400"
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {confirmDelete ? "Click again to delete" : "Delete"}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || (!isNew && !isDirty)}
            className="gap-2 border border-violet-500/40 bg-violet-500/20 font-semibold text-white hover:bg-violet-500/30"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isNew ? "Create Template" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Name shown to customers</Label>
                  <Input value={draft.name} onChange={(e) => update("name", e.target.value)} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Availability</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => update("isActive", !draft.isActive)}
                    className={`w-full justify-start ${
                      draft.isActive
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {draft.isActive ? "Active — customers can order this system" : "Inactive — hidden from customers"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Short description</Label>
                <Textarea
                  rows={2}
                  value={draft.description ?? ""}
                  onChange={(e) => update("description", e.target.value)}
                  className="resize-none bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    ["minPanels", "Min panels"],
                    ["defaultPanels", "Default panels"],
                    ["maxPanels", "Max panels"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">{label}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={draft[key]}
                      onChange={(e) => update(key, Math.max(1, Math.round(Number(e.target.value) || 1)))}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Info className="h-3.5 w-3.5" />
              Formula variables
            </p>
            <div className="grid gap-x-6 gap-y-1 text-[11px] text-zinc-400 sm:grid-cols-2">
              {FORMULA_HELP.map(([name, meaning]) => (
                <p key={name}>
                  <code className="mr-1.5 rounded bg-zinc-900 px-1 font-mono text-sky-300">{name}</code>
                  {meaning}
                </p>
              ))}
              <p className="sm:col-span-2">
                Use <code className="font-mono text-sky-300">+ - * / ( )</code> and{" "}
                <code className="font-mono text-sky-300">min max ceil floor round</code>. Example:{" "}
                <code className="font-mono text-sky-300">(W - 2) / P + 1</code>. Lines with quantity 0 are skipped.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Size bands</h3>
                <p className="text-[11px] text-zinc-500">
                  Checked top to bottom — the first band the size fits is used. Leave the last band without limits to
                  cover every larger size.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateBands((bands) => [...bands, newBand(profiles[0]?.code)])}
                className="gap-1.5 border-zinc-800 bg-zinc-900/50 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add band
              </Button>
            </div>
            {draft.sizeBands.map((band, index) => (
              <SizeBandEditor
                key={index}
                band={band}
                index={index}
                total={draft.sizeBands.length}
                profiles={profiles}
                onChange={(next) => updateBands((bands) => bands.map((b, i) => (i === index ? next : b)))}
                onRemove={() => updateBands((bands) => bands.filter((_, i) => i !== index))}
                onDuplicate={() =>
                  updateBands((bands) => [
                    ...bands.slice(0, index + 1),
                    { ...structuredClone(band), name: `${band.name} (copy)` },
                    ...bands.slice(index + 1),
                  ])
                }
                onMove={(direction) =>
                  updateBands((bands) => {
                    const next = [...bands];
                    const target = index + direction;
                    [next[index], next[target]] = [next[target], next[index]];
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="xl:sticky xl:top-4">
            <TemplatePreview template={draft} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DimensionInput({
  label,
  feet,
  inches,
  onChange,
}: {
  label: string;
  feet: string;
  inches: string;
  onChange: (feet: string, inches: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-zinc-400">{label}</Label>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Input type="number" min="0" value={feet} onChange={(e) => onChange(e.target.value, inches)} className="h-8 bg-zinc-900 border-zinc-800 pr-6 text-xs" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">ft</span>
        </div>
        <div className="relative flex-1">
          <Input type="number" min="0" max="11" value={inches} onChange={(e) => onChange(feet, e.target.value)} className="h-8 bg-zinc-900 border-zinc-800 pr-6 text-xs" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">in</span>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template }: { template: ProductTemplateInput }) {
  const [size, setSize] = useState({ wFt: "4", wIn: "0", hFt: "4", hIn: "0" });
  const [panels, setPanels] = useState(String(template.defaultPanels));
  const [verticalBars, setVerticalBars] = useState("0");
  const [horizontalBars, setHorizontalBars] = useState("0");
  const [bom, setBom] = useState<BomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const autoRan = useRef(false);

  const input = useMemo(
    () => ({
      measurements: {
        width: `${size.wFt || 0}'${size.wIn || 0}"`,
        height: `${size.hFt || 0}'${size.hIn || 0}"`,
      },
      panels: Number(panels) || template.defaultPanels,
      verticalBars: Number(verticalBars) || 0,
      horizontalBars: Number(horizontalBars) || 0,
    }),
    [size, panels, verticalBars, horizontalBars, template.defaultPanels]
  );

  const runPreview = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await adminMaterialsApi.previewTemplate(toInput(template), input);
      setBom(response.data ?? null);
    } catch (previewError) {
      setBom(null);
      setError(previewError instanceof Error ? previewError.message : "Preview failed");
    } finally {
      setIsRunning(false);
    }
  }, [template, input]);

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    runPreview();
  }, [runPreview]);

  return (
    <Card className="border-zinc-800 bg-zinc-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
          <Calculator className="h-4 w-4 text-violet-400" />
          Test with a size
        </CardTitle>
        <p className="text-[11px] text-zinc-500">Runs your unsaved rules — nothing is saved.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DimensionInput label="Width" feet={size.wFt} inches={size.wIn} onChange={(wFt, wIn) => setSize((s) => ({ ...s, wFt, wIn }))} />
          <DimensionInput label="Height" feet={size.hFt} inches={size.hIn} onChange={(hFt, hIn) => setSize((s) => ({ ...s, hFt, hIn }))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["Panels (P)", panels, setPanels],
              ["Vertical bars (MV)", verticalBars, setVerticalBars],
              ["Horizontal bars (TR)", horizontalBars, setHorizontalBars],
            ] as const
          ).map(([label, value, setter]) => (
            <div key={label} className="space-y-1">
              <Label className="text-[11px] text-zinc-400">{label}</Label>
              <Input type="number" min="0" value={value} onChange={(e) => setter(e.target.value)} className="h-8 bg-zinc-900 border-zinc-800 text-xs" />
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={runPreview}
          disabled={isRunning}
          className="w-full gap-2 border border-violet-500/30 bg-violet-600/20 text-violet-200 hover:bg-violet-600/35"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          Generate cut list
        </Button>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>
        )}
        {bom && <BomPreview bom={bom} showCosts />}
      </CardContent>
    </Card>
  );
}

export default function TemplateEditorPage() {
  return (
    <DashboardLayout title="Product Template">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        }
      >
        <TemplateEditor />
      </Suspense>
    </DashboardLayout>
  );
}
