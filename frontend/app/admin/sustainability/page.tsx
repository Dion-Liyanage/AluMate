"use client";

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
import {
  Banknote,
  Leaf,
  PackageCheck,
  Recycle,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo values only. These will be replaced by material-usage records from MongoDB.
const materialDistribution = [
  { name: "Used in projects", value: 960, color: "#34d399" },
  { name: "Reusable offcuts", value: 180, color: "#60a5fa" },
  { name: "Scrap waste", value: 42, color: "#f59e0b" },
];

const monthlyWaste = [
  { month: "May", wasteRate: 9.2 },
  { month: "Jun", wasteRate: 7.8 },
  { month: "Jul", wasteRate: 6.4 },
  { month: "Aug", wasteRate: 5.7 },
  { month: "Sep", wasteRate: 4.5 },
  { month: "Oct", wasteRate: 3.6 },
];

const projectMaterialUsage = [
  { project: "Office Partition", used: 180, reusable: 24, scrap: 5, wasteRate: 2.4 },
  { project: "Sliding Window Set", used: 245, reusable: 36, scrap: 12, wasteRate: 4.1 },
  { project: "Shop Front", used: 320, reusable: 58, scrap: 10, wasteRate: 2.6 },
  { project: "Residential Doors", used: 215, reusable: 31, scrap: 15, wasteRate: 5.8 },
];

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
};

export default function SustainabilityPage() {
  return (
    <DashboardLayout title="Sustainability Insights">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-zinc-100">Green Fabrication Dashboard</h2>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                Demo data
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Track aluminium use, recover reusable offcuts, and reduce fabrication waste.
            </p>
          </div>
          <Button
            type="button"
            disabled
            className="border border-zinc-700 bg-zinc-800 text-zinc-400 disabled:opacity-100"
            title="Available when material usage recording is added"
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Record Material Usage
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Aluminium Used"
            value="960 kg"
            detail="Across completed projects"
            icon={PackageCheck}
            iconClassName="text-emerald-400"
          />
          <MetricCard
            title="Reusable Offcuts"
            value="180 kg"
            detail="Available for future jobs"
            icon={Recycle}
            iconClassName="text-sky-400"
          />
          <MetricCard
            title="Scrap Waste"
            value="42 kg"
            detail="3.6% of total material"
            icon={Trash2}
            iconClassName="text-amber-400"
          />
          <MetricCard
            title="Estimated Cost Saved"
            value="Rs. 68,000"
            detail="By reusing offcuts"
            icon={Banknote}
            iconClassName="text-violet-400"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="border-zinc-800 bg-zinc-900/50 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                <Leaf className="h-5 w-5 text-emerald-400" />
                Material Distribution
              </CardTitle>
              <p className="text-sm text-zinc-500">How aluminium was used this month</p>
            </CardHeader>
            <CardContent>
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Project Material Performance</CardTitle>
            <p className="text-sm text-zinc-500">Use this view to identify projects creating the most scrap.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                {projectMaterialUsage.map((project) => (
                  <tr key={project.project} className="border-b border-zinc-800/70 last:border-0">
                    <td className="py-4 font-medium text-zinc-200">{project.project}</td>
                    <td className="py-4 text-zinc-400">{project.used} kg</td>
                    <td className="py-4 text-sky-300">{project.reusable} kg</td>
                    <td className="py-4 text-amber-300">{project.scrap} kg</td>
                    <td className="py-4 text-right">
                      <span
                        className={
                          project.wasteRate <= 3
                            ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300"
                            : "rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300"
                        }
                      >
                        {project.wasteRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-500">
          These are demonstration figures. They will be replaced with recorded material-usage data after fabrication jobs are completed.
        </p>
      </div>
    </DashboardLayout>
  );
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
