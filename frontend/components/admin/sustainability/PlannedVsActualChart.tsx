"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlanComparison } from "@/lib/api";

// Validated pair for the dark surface (lightness band, chroma, CVD & contrast all pass).
export const PLANNED_COLOR = "#3b82f6";
export const ACTUAL_COLOR = "#d97706";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#e4e4e7",
};

interface PlannedVsActualChartProps {
  data: PlanComparison[];
}

export function PlannedVsActualChart({ data }: PlannedVsActualChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[270px] items-center justify-center px-6 text-center text-sm text-zinc-500">
        Complete fabrication on an order with a saved cut list to compare planned and actual waste.
      </div>
    );
  }

  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} barCategoryGap="28%">
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="orderNumber" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            width={44}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#e4e4e7", fontWeight: 600 }}
            itemStyle={{ color: "#d4d4d8" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value, name) => [`${value}%`, name]}
          />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, color: "#a1a1aa", paddingBottom: 8 }} />
          <Bar dataKey="plannedWasteRate" name="Planned waste" fill={PLANNED_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="actualWasteRate" name="Actual waste" fill={ACTUAL_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
