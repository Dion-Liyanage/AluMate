"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Banknote, FileDown, Leaf, Loader2, PackageCheck, Recycle, Scissors, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadSustainabilityReport } from "@/lib/sustainability-report";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordMaterialUsageDialog } from "@/components/admin/sustainability/RecordMaterialUsageDialog";
import { PlannedVsActualChart } from "@/components/admin/sustainability/PlannedVsActualChart";
import { HighWasteOrders } from "@/components/admin/sustainability/HighWasteOrders";
import { MaterialRecordsTable } from "@/components/admin/sustainability/MaterialRecordsTable";
import { sustainabilityApi, type SustainabilityDashboardData } from "@/lib/api";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
};
// Recharts defaults tooltip text to dark colours — invisible on the dark card.
const tooltipLabelStyle = { color: "#e4e4e7", fontWeight: 600 };
const tooltipItemStyle = { color: "#e4e4e7" };

export default function SustainabilityPage() {
  const [dashboard, setDashboard] = useState<SustainabilityDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [recordsRefreshKey, setRecordsRefreshKey] = useState(0);

  const handleDownloadReport = async () => {
    if (!dashboard) return;
    setIsExporting(true);
    try {
      await downloadSustainabilityReport(dashboard);
    } catch (err) {
      console.error("Failed to create report:", err);
      toast.error("Could not create the PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sustainabilityApi.getDashboard();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to load sustainability data");
      }
      setDashboard(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sustainability data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary ?? {
    purchasedKg: 0,
    usedKg: 0,
    reusableOffcutsKg: 0,
    scrapWasteKg: 0,
    costSaved: 0,
    wasteRate: 0,
    efficiencyPct: 0,
  };
  const planAccuracy = dashboard?.planAccuracy;
  const plannedVsActual = dashboard?.plannedVsActual ?? [];
  const highWasteOrders = dashboard?.highWasteOrders ?? [];
  const materialDistribution = dashboard?.materialDistribution ?? [];
  const monthlyWaste = dashboard?.monthlyWaste ?? [];
  const projects = dashboard?.projects ?? [];

  return (
    <DashboardLayout title="Sustainability Insights">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Green Fabrication Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Track aluminium use, recover reusable offcuts, and reduce fabrication waste.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadReport}
              disabled={!dashboard || isExporting}
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            >
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download PDF Report
            </Button>
            <RecordMaterialUsageDialog
              onSaved={() => {
                loadDashboard();
                setRecordsRefreshKey((key) => key + 1);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Aluminium Used"
            value={`${formatNumber(summary.usedKg)} kg`}
            detail={`${summary.efficiencyPct ?? 0}% material efficiency`}
            icon={PackageCheck}
            iconClassName="text-emerald-400"
          />
          <MetricCard
            title="Reusable Offcuts"
            value={`${formatNumber(summary.reusableOffcutsKg)} kg`}
            detail="Available for future jobs"
            icon={Recycle}
            iconClassName="text-sky-400"
          />
          <MetricCard
            title="Scrap Waste"
            value={`${formatNumber(summary.scrapWasteKg)} kg`}
            detail={`${summary.wasteRate}% of purchased material`}
            icon={Trash2}
            iconClassName="text-amber-400"
          />
          <MetricCard
            title="Estimated Cost Saved"
            value={`Rs. ${Math.round(summary.costSaved).toLocaleString()}`}
            detail="By reusing offcuts"
            icon={Banknote}
            iconClassName="text-violet-400"
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-[380px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-5">
              <Card className="border-zinc-800 bg-zinc-900/50 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                    Material Distribution
                  </CardTitle>
                  <p className="text-sm text-zinc-500">How recorded aluminium was used</p>
                </CardHeader>
                <CardContent>
                  {materialDistribution.some((item) => item.value > 0) ? (
                    <div className="h-[270px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={materialDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                          >
                            {materialDistribution.map((item) => (
                              <Cell key={item.name} fill={item.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                          <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart label="Record material usage to see the distribution." />
                  )}
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/50 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100">Monthly Waste Rate</CardTitle>
                  <p className="text-sm text-zinc-500">Lower is better — target below 5%</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyWaste}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#71717a"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          labelStyle={tooltipLabelStyle}
                          itemStyle={tooltipItemStyle}
                          formatter={(value) => [`${value}%`, "Waste rate"]}
                          cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        />
                        <Bar dataKey="wasteRate" fill="#34d399" radius={[5, 5, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
              <Card className="border-zinc-800 bg-zinc-900/50 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                    <Scissors className="h-5 w-5 text-emerald-400" />
                    Planned vs Actual Waste
                  </CardTitle>
                  <p className="text-sm text-zinc-500">
                    {planAccuracy && planAccuracy.ordersWithPlan > 0
                      ? `Cutting optimiser planned ${planAccuracy.plannedWasteRate}% waste; the workshop produced ${planAccuracy.actualWasteRate}% across ${planAccuracy.ordersWithPlan} order${planAccuracy.ordersWithPlan === 1 ? "" : "s"}.`
                      : "Waste the cutting optimiser planned for each order, compared with what was recorded."}
                  </p>
                </CardHeader>
                <CardContent>
                  <PlannedVsActualChart data={plannedVsActual} />
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/50 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Orders Above Planned Waste
                  </CardTitle>
                  <p className="text-sm text-zinc-500">
                    Actual waste more than {planAccuracy?.highWasteMarginPct ?? 3} points above plan — worth a check
                    with the workshop.
                  </p>
                </CardHeader>
                <CardContent>
                  <HighWasteOrders
                    orders={highWasteOrders}
                    marginPct={planAccuracy?.highWasteMarginPct ?? 3}
                    ordersWithPlan={planAccuracy?.ordersWithPlan ?? 0}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-100">Project Material Performance</CardTitle>
                <p className="text-sm text-zinc-500">Identify projects that create the most scrap.</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {projects.length ? (
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="pb-3 font-medium">Project</th>
                        <th className="pb-3 font-medium">Used</th>
                        <th className="pb-3 font-medium">Reusable offcuts</th>
                        <th className="pb-3 font-medium">Scrap</th>
                        <th className="pb-3 text-right font-medium">Waste rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.project} className="border-b border-zinc-800/70 last:border-0">
                          <td className="py-4 font-medium text-zinc-200">{project.project}</td>
                          <td className="py-4 text-zinc-400">{formatNumber(project.used)} kg</td>
                          <td className="py-4 text-sky-300">{formatNumber(project.reusable)} kg</td>
                          <td className="py-4 text-amber-300">{formatNumber(project.scrap)} kg</td>
                          <td className="py-4 text-right">
                            <span className={wasteRateClass(project.wasteRate)}>{project.wasteRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center text-sm text-zinc-500">
                    No material records yet. Complete fabrication from an order to record actual material usage.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        <MaterialRecordsTable refreshKey={recordsRefreshKey} onChanged={loadDashboard} />
      </div>
    </DashboardLayout>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <div className="flex h-[270px] items-center justify-center text-center text-sm text-zinc-500">{label}</div>;
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Leaf;
  iconClassName: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/80 p-2.5">
            <Icon className={`h-5 w-5 ${iconClassName}`} />
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
        <p className="mt-1 text-xs text-zinc-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function formatNumber(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

function wasteRateClass(rate: number) {
  return rate <= 3
    ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300"
    : "rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300";
}
