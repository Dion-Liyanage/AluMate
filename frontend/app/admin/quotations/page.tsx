"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Eye, Send, Clock, CheckCircle2, Loader2,
  Search, Filter, RotateCw, Calendar, X, Upload,
  Ruler, Palette, StickyNote, Package, Banknote, Download
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { adminOrdersApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { animate } from "framer-motion";

const QUOTATION_STATUSES = ["quotation_pending", "quotation_sent"];

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1, ease: "easeOut", onUpdate(val) { setCount(Math.round(val)); } });
    return () => controls.stop();
  }, [value]);
  return <>{count}</>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    quotation_pending: { label: "Pending Review", className: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
    quotation_sent: { label: "Quotation Sent", className: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
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
  catalogueDesignId?: any;
  status: string;
  estimatedPrice: number;
  measurements: Record<string, any>;
  purpose: string;
  environment: string;
  strengthCategory: string;
  color?: string;
  accessories?: string[];
  notes: any[];
  customerId: any;
  createdAt: string;
  finalMaterialCost?: number;
  finalLaborCost?: number;
  finalTotalCost?: number;
  quotationPdfUrl?: string;
  quotationSentAt?: string;
}

function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<QuotationOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Admin form state
  const [finalMaterialCost, setFinalMaterialCost] = useState("");
  const [finalLaborCost, setFinalLaborCost] = useState("");
  const [finalTotalCost, setFinalTotalCost] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await adminOrdersApi.getAll({ limit: 200 });
      if (response.success && response.data) {
        const allOrders = (response.data as any) || [];
        const orders = Array.isArray(allOrders) ? allOrders : (allOrders.orders || []);
        setQuotations(orders.filter((o: any) => QUOTATION_STATUSES.includes(o.status)));
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  const openDrawer = (order: QuotationOrder) => {
    setSelectedOrder(order);
    setFinalMaterialCost(order.finalMaterialCost?.toString() || "");
    setFinalLaborCost(order.finalLaborCost?.toString() || "");
    setFinalTotalCost(order.finalTotalCost?.toString() || "");
    setPdfFile(null);
    setIsDrawerOpen(true);
  };

  const handleSendQuotation = async () => {
    if (!selectedOrder) return;
    const matCost = parseFloat(finalMaterialCost);
    const labCost = parseFloat(finalLaborCost);
    const totCost = parseFloat(finalTotalCost);

    if (isNaN(matCost) || isNaN(labCost) || isNaN(totCost)) {
      toast.error("Please fill in all cost fields with valid numbers.");
      return;
    }

    setIsSending(true);
    try {
      const response = await adminOrdersApi.generateQuotation(selectedOrder._id, {
        finalMaterialCost: matCost,
        finalLaborCost: labCost,
        finalTotalCost: totCost,
        quotationPdf: pdfFile || undefined,
      });
      if (response.success) {
        toast.success("Quotation sent to customer!");
        setIsDrawerOpen(false);
        fetchQuotations();
      } else {
        toast.error("Failed to send quotation");
      }
    } catch (error) {
      toast.error("Error sending quotation");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await adminOrdersApi.cancel(id);
      if (response.success) {
        toast.success("Quotation request cancelled");
        fetchQuotations();
      } else {
        toast.error("Failed to cancel");
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

  const getCustomerName = (q: QuotationOrder) => {
    if (q.customerId && typeof q.customerId === 'object') {
      return `${q.customerId.firstName || ''} ${q.customerId.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown Customer';
  };

  const filtered = quotations.filter(q => {
    const matchesSearch =
      q.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.productType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(q).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: "Pending Review", value: stats.pending, icon: Clock, color: "from-amber-500/30 to-amber-600/20", iconColor: "text-amber-300", borderColor: "border-amber-500/40" },
    { title: "Sent to Customer", value: stats.sent, icon: Send, color: "from-blue-500/30 to-blue-600/20", iconColor: "text-blue-300", borderColor: "border-blue-500/40" },
    { title: "Total Requests", value: stats.total, icon: FileText, color: "from-indigo-500/30 to-indigo-600/20", iconColor: "text-indigo-300", borderColor: "border-indigo-500/40" },
  ];

  return (
    <DashboardLayout title="Quotation Requests">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <FileText className="h-6 w-6 text-blue-100" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-100">Quotation Requests</h1>
          </div>
          <p className="text-zinc-400">Review customer quotation requests, finalize materials and send quotations.</p>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-blue-500/5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] opacity-70" />
          <div className="absolute top-8 right-8 opacity-[0.12] pointer-events-none"><FileText className="w-48 h-48 text-blue-300" /></div>
          <CardHeader className="relative pb-4">
            <CardTitle className="text-2xl text-zinc-100">Quotations Overview</CardTitle>
            <CardDescription className="text-zinc-400 mt-1">Manage incoming fabrication quotation requests.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {statCards.map((stat) => (
                <div key={stat.title} className={`relative overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg group/card`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100"><AnimatedCounter value={stat.value} /></p>
                  <p className="text-xs text-zinc-400 font-medium">{stat.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="Search by customer, product or ID..." className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-zinc-950/50 border-zinc-800 text-zinc-300"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="quotation_pending">Pending Review</SelectItem>
                <SelectItem value="quotation_sent">Sent to Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchQuotations} disabled={isLoading} className="text-zinc-500 hover:text-zinc-300 h-9 px-3 ml-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RotateCw className="h-4 w-4 mr-2" />Refresh</>}
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-zinc-400">Loading quotation requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4">
              <FileText className="h-8 w-8 text-zinc-700" />
            </div>
            <h3 className="text-zinc-300 font-semibold text-lg">No quotation requests</h3>
            <p className="text-zinc-500 text-sm mt-1">No pending quotation requests from customers.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="hover:bg-transparent border-zinc-800/50">
                  <TableHead className="text-zinc-400 font-bold text-center">Order ID</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Customer</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Product</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Design</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Estimated Price</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Status</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Date</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((q) => (
                  <TableRow key={q._id} className="border-zinc-800/50 hover:bg-zinc-900/40 transition-all group">
                    <TableCell className="font-mono text-zinc-300 font-medium text-center">{q.orderId}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-zinc-200 font-semibold">{getCustomerName(q)}</span>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-center capitalize">{q.productType}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-wider uppercase font-bold ${q.designType === 'custom' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                        {q.designType === 'custom' ? 'Custom' : 'Catalogue'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center text-emerald-400 font-bold">
                        <span className="text-[10px] mr-1 opacity-70">LKR</span>
                        {q.estimatedPrice?.toLocaleString() || "Pending"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><div className="flex justify-center"><StatusBadge status={q.status} /></div></TableCell>
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
                          onClick={() => openDrawer(q)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        {q.status === 'quotation_pending' && (
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

        {/* Details Drawer / Dialog */}
        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-3xl max-h-[92vh] overflow-hidden p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex max-h-[92vh] flex-col">
              <DialogHeader className="shrink-0 border-b border-zinc-800 px-6 py-5 bg-zinc-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-zinc-100">Order Details</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      {selectedOrder?.orderId} — Review and prepare final quotation
                    </DialogDescription>
                  </div>
                  <StatusBadge status={selectedOrder?.status || ""} />
                </div>
              </DialogHeader>

              {selectedOrder && (
                <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-8">
                    {/* Order Info */}
                    <section>
                      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        Order Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Product Type</p>
                          <p className="text-sm text-zinc-100 font-bold capitalize">{selectedOrder.productType}</p>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Source</p>
                          <p className="text-sm text-zinc-100 font-bold capitalize">
                            {selectedOrder.designType === 'catalogue' ? 'Catalogue' : 'Custom Design'}
                          </p>
                        </div>
                        {selectedOrder.catalogueDesignId && (
                          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design ID</p>
                            <p className="text-sm text-zinc-100 font-bold font-mono">
                              {typeof selectedOrder.catalogueDesignId === 'object'
                                ? (selectedOrder.catalogueDesignId.designCode || selectedOrder.catalogueDesignId._id)
                                : selectedOrder.catalogueDesignId}
                            </p>
                          </div>
                        )}
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Customer</p>
                          <p className="text-sm text-zinc-100 font-bold">{getCustomerName(selectedOrder)}</p>
                        </div>
                      </div>
                    </section>

                    <Separator className="bg-zinc-800/50" />

                    {/* Design Image Placeholder */}
                    {selectedOrder.catalogueDesignId && typeof selectedOrder.catalogueDesignId === 'object' && selectedOrder.catalogueDesignId.imageUrl && (
                      <>
                        <section>
                          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Design Image</h4>
                          <div className="rounded-xl border border-zinc-800/50 overflow-hidden bg-white max-h-60 flex items-center justify-center">
                            <img
                              src={selectedOrder.catalogueDesignId.imageUrl}
                              alt="Design"
                              className="max-h-60 object-contain"
                            />
                          </div>
                        </section>
                        <Separator className="bg-zinc-800/50" />
                      </>
                    )}

                    {/* Customer Inputs: Measurements */}
                    <section>
                      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Ruler className="h-3.5 w-3.5" />
                        Measurements
                      </h4>
                      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedOrder.measurements).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center border-b border-zinc-800/30 pb-2 last:border-0 last:pb-0">
                              <span className="text-xs text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-sm font-bold text-zinc-200">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Color & Finish */}
                    {selectedOrder.color && (
                      <section>
                        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Palette className="h-3.5 w-3.5" />
                          Color & Finish
                        </h4>
                        <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                          <p className="text-sm text-zinc-200 capitalize font-medium">{selectedOrder.color.replace(/-/g, ' ')}</p>
                        </div>
                      </section>
                    )}

                    {/* Additional Notes */}
                    {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                      <section>
                        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <StickyNote className="h-3.5 w-3.5" />
                          Additional Notes
                        </h4>
                        <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50 space-y-2">
                          {selectedOrder.notes.map((n: any, idx: number) => (
                            <p key={idx} className="text-sm text-zinc-400 italic">&quot;{n.message}&quot;
                              <span className="text-[10px] text-zinc-600 ml-2">— {n.createdBy}</span>
                            </p>
                          ))}
                        </div>
                      </section>
                    )}

                    <Separator className="bg-zinc-800/50" />

                    {/* Initial Estimate */}
                    <section>
                      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Banknote className="h-3.5 w-3.5" />
                        Initial Estimate (Auto-calculated)
                      </h4>
                      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Estimated Total</span>
                          <span className="text-lg font-bold text-emerald-400">
                            {formatLKR(selectedOrder.estimatedPrice || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-zinc-500">Cost Range</span>
                          <span className="text-sm text-zinc-300">
                            {formatLKR((selectedOrder.estimatedPrice || 0) * 0.9)} — {formatLKR((selectedOrder.estimatedPrice || 0) * 1.15)}
                          </span>
                        </div>
                      </div>
                    </section>

                    <Separator className="bg-zinc-800/50" />

                    {/* Admin Final Quotation Form */}
                    {selectedOrder.status === 'quotation_pending' && (
                      <section>
                        <h4 className="text-[11px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Send className="h-3.5 w-3.5" />
                          Prepare Final Quotation
                        </h4>
                        <div className="bg-violet-500/5 rounded-xl p-5 border border-violet-500/20 space-y-5">
                          {/* Cost Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Material Cost (LKR)</label>
                              <Input
                                type="number"
                                placeholder="e.g. 35000"
                                value={finalMaterialCost}
                                onChange={(e) => setFinalMaterialCost(e.target.value)}
                                className="bg-zinc-900/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Labor Cost (LKR)</label>
                              <Input
                                type="number"
                                placeholder="e.g. 12000"
                                value={finalLaborCost}
                                onChange={(e) => setFinalLaborCost(e.target.value)}
                                className="bg-zinc-900/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Cost (LKR)</label>
                              <Input
                                type="number"
                                placeholder="e.g. 50000"
                                value={finalTotalCost}
                                onChange={(e) => setFinalTotalCost(e.target.value)}
                                className="bg-zinc-900/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                              />
                            </div>
                          </div>

                          {/* PDF Upload */}
                          <div className="space-y-2">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Quotation PDF (Optional)</label>
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="pdf-upload"
                              />
                              <label
                                htmlFor="pdf-upload"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors"
                              >
                                <Upload className="h-5 w-5 text-zinc-500" />
                                <span className="text-sm text-zinc-400">
                                  {pdfFile ? pdfFile.name : "Click to upload PDF"}
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Send Button */}
                          <Button
                            onClick={handleSendQuotation}
                            disabled={isSending || !finalMaterialCost || !finalLaborCost || !finalTotalCost}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                          >
                            {isSending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                            ) : (
                              <><Send className="h-4 w-4 mr-2" />Send Final Quotation</>
                            )}
                          </Button>
                        </div>
                      </section>
                    )}

                    {/* Already Sent Summary */}
                    {selectedOrder.status === 'quotation_sent' && (
                      <section>
                        <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Final Quotation (Sent)
                        </h4>
                        <div className="bg-blue-500/5 rounded-xl p-5 border border-blue-500/20 space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">Material</p>
                              <p className="text-sm font-bold text-zinc-200">{formatLKR(selectedOrder.finalMaterialCost || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">Labor</p>
                              <p className="text-sm font-bold text-zinc-200">{formatLKR(selectedOrder.finalLaborCost || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">Total</p>
                              <p className="text-lg font-bold text-emerald-400">{formatLKR(selectedOrder.finalTotalCost || 0)}</p>
                            </div>
                          </div>
                          {selectedOrder.quotationPdfUrl && (
                            <a
                              href={selectedOrder.quotationPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 underline"
                            >
                              <Download className="h-4 w-4" />
                              Download Quotation PDF
                            </a>
                          )}
                          {selectedOrder.quotationSentAt && (
                            <p className="text-[10px] text-zinc-500">
                              Sent on {format(new Date(selectedOrder.quotationSentAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Close */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        Close
                      </Button>
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
