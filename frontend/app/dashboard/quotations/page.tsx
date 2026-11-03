"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Eye, Check, X, Calendar, Banknote, Loader2,
  Clock, CheckCircle2, Send, Search, Filter, Download, Package
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ordersApi, designsApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { animate } from "framer-motion";
import { formatMeasurement } from "@/lib/utils";

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

function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface QuotationOrder {
  _id: string;
  orderId: string;
  productType: string;
  designType: string;
  catalogueDesignId?: any;
  status: string;
  estimatedPrice: number;
  measurements: Record<string, any>;
  purpose: string;
  environment: string;
  strengthCategory: string;
  color?: string;
  accessories?: string[];
  recommendedMaterials?: any[];
  laborCalculation?: any;
  notes: any[];
  createdAt: string;
  finalMaterialCost?: number;
  finalLaborCost?: number;
  finalTotalCost?: number;
  quotationPdfUrl?: string;
  quotationSentAt?: string;
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
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    fetchQuotations();
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const res = await designsApi.getAll();
      if (res.success && res.data) {
        setDesigns(res.data);
      }
    } catch (e) {
      console.error("Failed to load designs:", e);
    }
  };

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
        setIsDetailsOpen(false);
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
        setIsDetailsOpen(false);
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

  const resolvedDesign = selectedQuotation
    ? (typeof selectedQuotation.catalogueDesignId === 'object' && selectedQuotation.catalogueDesignId !== null
      ? selectedQuotation.catalogueDesignId
      : (selectedQuotation.catalogueDesignId ? designs.find(d => d._id === selectedQuotation.catalogueDesignId) : null))
    : null;

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
                    <TableHead className="text-zinc-400 font-semibold py-4 text-center">Order ID</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">Product Type</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">Estimated Amount</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">Status</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">Submitted</TableHead>
                    <TableHead className="text-zinc-400 font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q) => (
                    <TableRow 
                      key={q._id} 
                      className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">
                              {q.orderId}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
                              {q.designType === 'custom' ? 'Custom Design' : 'Catalogue'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-zinc-300 font-medium capitalize">
                          {q.productType}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center text-emerald-400 font-bold text-[13px]">
                          <span className="text-[10px] mr-1 opacity-70">LKR</span>
                          {q.status === 'quotation_sent' && q.finalTotalCost
                            ? q.finalTotalCost.toLocaleString()
                            : q.estimatedPrice?.toLocaleString() || "Pending"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <QuotationStatusBadge status={q.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {q.createdAt ? format(new Date(q.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white text-xs"
                            onClick={() => {
                              setSelectedQuotation(q);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>

                          {q.status === 'quotation_sent' ? (
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold"
                              onClick={() => handleApprove(q._id)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Confirm Order
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 text-xs"
                              onClick={() => handleCancel(q._id)}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Quotation Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex max-h-[90vh] flex-col">
              <DialogHeader className="shrink-0 border-b border-zinc-800 px-6 py-5 bg-zinc-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-zinc-100">Quotation Details</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Order ID: {selectedQuotation?.orderId}
                    </DialogDescription>
                  </div>
                  <QuotationStatusBadge status={selectedQuotation?.status || ""} />
                </div>
              </DialogHeader>

              {selectedQuotation && (
                <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-8">
                {/* Product Info */}
                <section>
                  <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Product Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/80 transition-colors">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Product Type</p>
                      <p className="text-sm text-zinc-100 font-bold capitalize">{selectedQuotation.productType}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/80 transition-colors">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Source</p>
                      <p className="text-sm text-zinc-100 font-bold capitalize">
                        {selectedQuotation.designType === 'catalogue' ? 'Catalogue Selection' : 'Custom Design'}
                      </p>
                    </div>
                    {resolvedDesign ? (
                      <>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Code</p>
                          <p className="text-sm text-zinc-100 font-bold font-mono">
                            {resolvedDesign.designCode || resolvedDesign._id}
                          </p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Name</p>
                          <p className="text-sm text-zinc-100 font-bold">
                            {resolvedDesign.title || 'Catalogue Design'}
                          </p>
                        </div>
                      </>
                    ) : selectedQuotation.catalogueDesignId && (
                      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design ID</p>
                        <p className="text-sm text-zinc-100 font-bold font-mono">
                          {typeof selectedQuotation.catalogueDesignId === 'string' ? selectedQuotation.catalogueDesignId : selectedQuotation.catalogueDesignId._id}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <Separator className="bg-zinc-800/50" />

                {/* Design Details Card */}
                {resolvedDesign && (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-400" />
                          Design Details
                        </h4>
                        <Link href={`/dashboard/catalogue/${resolvedDesign._id}`} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                            View Design
                          </Button>
                        </Link>
                      </div>
                      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                        {(resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl) && (
                          <div className="w-full md:w-1/3 h-32 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={(resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl).startsWith('/')
                                ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl}`
                                : (resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl)}
                              alt={resolvedDesign.title || "Design"}
                              className="max-h-28 object-contain rounded-md"
                            />
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {resolvedDesign.designCode && (
                              <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 font-mono tracking-wider font-bold">
                                {resolvedDesign.designCode}
                              </span>
                            )}
                            <h5 className="text-sm font-bold text-zinc-200">{resolvedDesign.title}</h5>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-3">{resolvedDesign.description}</p>
                        </div>
                      </div>
                    </section>
                    <Separator className="bg-zinc-800/50" />
                  </>
                )}

                {/* Specifications */}
                <section>
                  <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Color / Finish</p>
                      <p className="text-sm text-zinc-200 capitalize">{selectedQuotation.color || 'Default'}</p>
                    </div>
                    {selectedQuotation.strengthCategory && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Strength</p>
                        <p className="text-sm text-zinc-200 capitalize">{selectedQuotation.strengthCategory}</p>
                      </div>
                    )}
                  </div>
                </section>

                <Separator className="bg-zinc-800/50" />

                {/* Measurements */}
                <section>
                  <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Measurements</h4>
                  <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedQuotation.measurements).map(([key, value]) => (
                        <div key={key} className="relative flex items-center border-b border-zinc-800/30 pb-2 last:border-0 last:pb-0 h-7">
                          <span className="text-xs text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-zinc-200">{formatMeasurement(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Quotation Sent — Show Final Costs + PDF */}
                {selectedQuotation.status === 'quotation_sent' && (
                  <>
                    <Separator className="bg-zinc-800/50" />
                    <section>
                      <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Final Quotation</h4>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                          <span className="text-xs text-zinc-400">Material Cost</span>
                          <span className="text-sm font-bold text-zinc-200">{formatLKR(selectedQuotation.finalMaterialCost || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                          <span className="text-xs text-zinc-400">Labor Cost</span>
                          <span className="text-sm font-bold text-zinc-200">{formatLKR(selectedQuotation.finalLaborCost || 0)}</span>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mb-1">Total Cost</p>
                          <p className="text-2xl font-black text-emerald-400">{formatLKR(selectedQuotation.finalTotalCost || 0)}</p>
                        </div>
                      </div>

                      {/* PDF Download */}
                      {selectedQuotation.quotationPdfUrl && (
                        <a
                          href={selectedQuotation.quotationPdfUrl.includes('cloudinary.com') && !selectedQuotation.quotationPdfUrl.includes('fl_attachment') ? selectedQuotation.quotationPdfUrl.replace('/upload/', '/upload/fl_attachment/') : selectedQuotation.quotationPdfUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-4 w-full py-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download Full Quotation PDF
                        </a>
                      )}

                      {/* Confirm Button */}
                      <Button 
                        onClick={() => {
                          handleApprove(selectedQuotation._id);
                        }}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirm Order
                      </Button>
                    </section>
                  </>
                )}

                {/* Pending Status — Show Estimated Only */}
                {selectedQuotation.status === 'quotation_pending' && (
                  <>
                    <Separator className="bg-zinc-800/50" />
                    <section>
                      <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Estimated Cost</h4>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-amber-400 uppercase font-black tracking-[0.2em] mb-1">Estimated Range</p>
                            <p className="text-lg font-bold text-zinc-200">
                              {formatLKR((selectedQuotation.estimatedPrice || 0) * 0.9)} — {formatLKR((selectedQuotation.estimatedPrice || 0) * 1.15)}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-3">
                          Your request is being reviewed by our fabrication experts. You will be notified once the final quotation is ready.
                        </p>
                      </div>
                    </section>
                  </>
                )}

                {/* Footer Notes */}
                {selectedQuotation.notes && selectedQuotation.notes.length > 0 && (
                  <section className="bg-zinc-900/20 rounded-lg p-4 border border-zinc-800/30">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Customer Notes</p>
                    {selectedQuotation.notes.map((n: any, idx: number) => (
                      <p key={idx} className="text-sm text-zinc-400 italic">&quot;{n.message}&quot;</p>
                    ))}
                  </section>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedQuotation.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                      onClick={() => {
                        handleCancel(selectedQuotation._id);
                      }}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
