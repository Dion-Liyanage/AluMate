"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText,
  Eye,
  Check,
  X,
  MoreVertical,
  Calendar,
  IndianRupee,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Send
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { animate } from "framer-motion";
import { Search, Filter } from "lucide-react";

// Quotation statuses (subset of Order statuses)
const QUOTATION_STATUSES = ["quotation_pending", "quotation_sent"];

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(val) {
        setCount(Math.round(val));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <>{count}</>;
}

function QuotationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    quotation_pending: {
      label: "Pending Review",
      className: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    },
    quotation_sent: {
      label: "Quotation Sent",
      className: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    },
  };

  const c = config[status] || { label: status, className: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10" };
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full border tracking-wider uppercase font-bold ${c.className}`}>
      {c.label}
    </span>
  );
}

interface QuotationOrder {
  _id: string;
  orderId: string;
  productType: string;
  designType: string;
  status: string;
  estimatedPrice: number;
  measurements: Record<string, any>;
  purpose: string;
  environment: string;
  strengthCategory: string;
  notes: any[];
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getAll();
      if (response.success && response.data) {
        const orders = (response.data.orders || response.data || []) as any[];
        // Filter to only quotation-stage statuses
        const quotationOrders = orders.filter((o: any) =>
          QUOTATION_STATUSES.includes(o.status)
        );
        setQuotations(quotationOrders);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await ordersApi.approve(id);
      if (response.success) {
        toast.success("Quotation approved! Your order is now confirmed.");
        fetchQuotations();
      } else {
        toast.error(response.message || "Failed to approve quotation");
      }
    } catch (error) {
      toast.error("Error approving quotation");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await ordersApi.cancel(id);
      if (response.success) {
        toast.success("Quotation request cancelled");
        fetchQuotations();
      } else {
        toast.error(response.message || "Failed to cancel request");
      }
    } catch (error) {
      toast.error("Error cancelling request");
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'quotation_pending').length,
    sent: quotations.filter(q => q.status === 'quotation_sent').length,
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.productType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: "Pending Review", value: stats.pending, icon: Clock, color: "from-amber-500/30 to-amber-600/20", iconColor: "text-amber-300", borderColor: "border-amber-500/40" },
    { title: "Quotation Sent", value: stats.sent, icon: Send, color: "from-blue-500/30 to-blue-600/20", iconColor: "text-blue-300", borderColor: "border-blue-500/40" },
    { title: "Total Requests", value: stats.total, icon: FileText, color: "from-indigo-500/30 to-indigo-600/20", iconColor: "text-indigo-300", borderColor: "border-indigo-500/40" },
  ];

  return (
    <DashboardLayout title="Quotations">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <FileText className="h-6 w-6 text-blue-400" />
              </span>
              Quotations
            </h2>
            <p className="mt-2 text-zinc-400">
              Track your quotation requests and approve finalized estimates.
            </p>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-blue-500/5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-8 right-8 opacity-[0.15] pointer-events-none group-hover:opacity-[0.2] transition-opacity">
              <FileText className="w-48 h-48 text-blue-300" />
            </div>
            <CardHeader className="relative pb-4">
              <CardTitle className="text-2xl text-zinc-100">Quotations Overview</CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                Track your fabrication quotation requests and approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {statCards.map((stat) => (
                  <div key={stat.title} className={`relative h-full overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg group/card`}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor} group-hover/card:bg-black/60 transition-colors`}>
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-zinc-100 group-hover/card:scale-105 transition-transform origin-left">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-xs text-zinc-400 font-medium group-hover/card:text-zinc-300 transition-colors">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by order ID or product..."
                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-zinc-950/50 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="quotation_pending">Pending Review</SelectItem>
                  <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="mt-4 text-zinc-400 font-medium">Loading your quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800">
              <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4">
                <FileText className="h-8 w-8 text-zinc-700" />
              </div>
              <h3 className="text-zinc-300 font-semibold text-lg">No quotation requests</h3>
              <p className="text-zinc-500 text-sm mt-1">
                Submit a quotation request from the Design Catalogue to get started.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-2xl">
              <Table>
                <TableHeader className="bg-zinc-950/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-semibold py-4">Order ID</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Product Type</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Estimated Amount</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Submitted</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q) => (
                    <TableRow 
                      key={q._id} 
                      className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">
                              {q.orderId}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
                              {q.designType === 'custom' ? 'Custom Design' : 'Catalogue'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-300 font-medium capitalize">
                          {q.productType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-emerald-400 font-bold">
                          <IndianRupee className="h-3 w-3 mr-0.5" />
                          {q.estimatedPrice?.toLocaleString() || "Pending"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <QuotationStatusBadge status={q.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {q.createdAt ? format(new Date(q.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {q.status === 'quotation_sent' && (
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold"
                              onClick={() => handleApprove(q._id)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 w-48 p-1 shadow-2xl">
                              {q.status === 'quotation_sent' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(q._id)}
                                    className="text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer rounded-md font-medium"
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Approve Quotation
                                  </DropdownMenuItem>
                                  <div className="h-px bg-zinc-800 my-1" />
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleCancel(q._id)}
                                className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer rounded-md font-medium"
                              >
                                <X className="h-4 w-4 mr-2" /> Cancel Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
