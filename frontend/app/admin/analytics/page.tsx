
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { analyticsApi } from "@/lib/api";

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await analyticsApi.getDashboardData();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Business Analytics">
        <div className="flex min-h-[60vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const statusData = [
    { name: "Pending", value: data?.stats.pendingQuotations || 0 },
    { name: "Active Orders", value: data?.stats.totalOrders || 0 },
    { name: "Service Requests", value: data?.stats.activeServiceRequests || 0 },
  ];

  return (
    <DashboardLayout title="Business Analytics">
      <div className="space-y-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Performance Insights</h2>
            <p className="text-zinc-400 text-sm mt-1">Real-time data from your fabrication operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <Calendar className="h-4 w-4 mr-2" />
              Last 6 Months
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Revenue" 
            value={`Rs. ${data?.stats.totalRevenue.toLocaleString()}`} 
            icon={DollarSign} 
            trend="+12.5%" 
            color="text-emerald-400"
          />
          <MetricCard 
            title="Total Orders" 
            value={data?.stats.totalOrders} 
            icon={ShoppingCart} 
            trend="+8.2%" 
            color="text-blue-400"
          />
          <MetricCard 
            title="Total Customers" 
            value={data?.stats.totalCustomers} 
            icon={Users} 
            trend="+4.1%" 
            color="text-violet-400"
          />
          <MetricCard 
            title="Avg. Project Value" 
            value={`Rs. ${Math.round(data?.stats.totalRevenue / (data?.stats.totalOrders || 1)).toLocaleString()}`} 
            icon={TrendingUp} 
            trend="+2.4%" 
            color="text-amber-400"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-100">Revenue & Order Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-100">Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-zinc-400">Total active items: <span className="text-zinc-100 font-bold">{(data?.stats.totalOrders || 0) + (data?.stats.pendingQuotations || 0) + (data?.stats.activeServiceRequests || 0)}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-100">Product Popularity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.stats.productDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="value" name="Order Count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                      {data?.stats.productDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-100">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Top Product</p>
                  <p className="text-xl font-bold text-zinc-100 mt-1">{data?.stats.productDistribution?.[0]?.name || "N/A"}</p>
                </div>
                <Separator className="bg-zinc-800" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Customers</p>
                  <p className="text-xl font-bold text-zinc-100 mt-1">{data?.stats.totalCustomers || 0}</p>
                </div>
                <Separator className="bg-zinc-800" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Quotation Conv. Rate</p>
                  <p className="text-xl font-bold text-zinc-100 mt-1">
                    {Math.round((data?.stats.totalOrders / (data?.stats.pendingQuotations + data?.stats.totalOrders || 1)) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        </div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
