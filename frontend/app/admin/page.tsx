"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  Users,
  LayoutGrid,
  Wrench,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminOperationCards } from "@/components/admin/AdminOperationCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { analyticsApi } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Placeholder analytics — will be replaced with API data
const analyticsCards = [
  {
    title: "Total Orders",
    value: "0",
    trend: "+0%",
    icon: ClipboardList,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    trendUp: true,
  },
  {
    title: "Revenue",
    value: "Rs. 0",
    trend: "+0%",
    icon: DollarSign,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    trendUp: true,
  },
  {
    title: "Active Customers",
    value: "0",
    trend: "+0%",
    icon: Users,
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
    trendUp: true,
  },
  {
    title: "Pending Quotations",
    value: "0",
    trend: "",
    icon: FileText,
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
    trendUp: false,
  },
  {
    title: "Service Requests",
    value: "0",
    trend: "",
    icon: Wrench,
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    trendUp: false,
  },
];

const quickLinks = [
  { href: "/admin/orders", label: "Manage Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "View Customers", icon: Users },
  { href: "/admin/designs", label: "Design Catalogue", icon: LayoutGrid },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/services", label: "Service Requests", icon: Wrench },
];

const recentActivity: {
  id: string;
  message: string;
  time: string;
  type: string;
}[] = [];

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsApi.getDashboardData();
        if (response.success && response.data) {
          setStats(response.data.stats);
          setChartData(response.data.chartData);
          setActivity(response.data.activity);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const liveAnalyticsCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || "0",
      trend: "+12%",
      icon: ClipboardList,
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-400",
      trendUp: true,
    },
    {
      title: "Revenue",
      value: `Rs. ${stats?.totalRevenue?.toLocaleString() || "0"}`,
      trend: "+8%",
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-400",
      trendUp: true,
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || "0",
      trend: "+5%",
      icon: Users,
      color: "from-violet-500/20 to-violet-600/10",
      iconColor: "text-violet-400",
      trendUp: true,
    },
    {
      title: "Quotations",
      value: stats?.pendingQuotations || "0",
      trend: "Pending",
      icon: FileText,
      color: "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-400",
      trendUp: false,
    },
    {
      title: "Service",
      value: stats?.activeServiceRequests || "0",
      trend: "Active",
      icon: Wrench,
      color: "from-cyan-500/20 to-cyan-600/10",
      iconColor: "text-cyan-400",
      trendUp: false,
    },
  ];

  if (isLoading || (user && user.role !== "admin")) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading admin dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* 1. Welcome Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-zinc-100">
            Welcome back, Admin! 👋
          </h2>
          <p className="mt-1 text-zinc-400">
            Monitor and manage your aluminium fabrication business operations.
          </p>
        </motion.div>

        {/* 2. Business Operations Section ⭐ */}
        <motion.div variants={itemVariants}>
          <AdminOperationCards />
        </motion.div>

        {/* 3. Statistics Cards */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 grid-cols-2 md:grid-cols-5"
        >
          {liveAnalyticsCards.map((card) => (
            <Card
              key={card.title}
              className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
              <CardContent className="relative p-5">
                <div className="flex flex-col gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center border border-zinc-800`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                      {card.title}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-xl font-bold text-zinc-100">
                        {card.value}
                      </p>
                      {card.trend && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            card.trendUp
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts placeholder + Quick links */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg text-zinc-100 font-semibold">
                    Order Trends
                  </CardTitle>
                  <p className="text-xs text-zinc-500">Order volume over the last 6 months</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5'
                        }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorOrders)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-zinc-100">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      >
                        <link.icon className="h-4 w-4 mr-3 text-zinc-500" />
                        {link.label}
                        <ArrowRight className="h-4 w-4 ml-auto text-zinc-600" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-zinc-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item, index) => (
                    <div key={item.id} className="group">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            item.type === 'order' ? 'bg-blue-500/10 text-blue-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {item.type === 'order' ? <ClipboardList className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-zinc-500">
                              {item.time}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4 text-zinc-500" />
                        </Button>
                      </div>
                      {index < activity.length - 1 && (
                        <Separator className="bg-zinc-800/50 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
