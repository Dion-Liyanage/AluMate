"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { QuotationsOverviewCards } from "@/components/dashboard/quotations/QuotationsOverviewCards";
import { QuotationsSearchFilters } from "@/components/dashboard/quotations/QuotationsSearchFilters";
import { QuotationsTable } from "@/components/dashboard/quotations/QuotationsTable";
import { EmptyQuotationState } from "@/components/dashboard/quotations/EmptyQuotationState";
import { QuotationDetailsDrawer } from "@/components/dashboard/quotations/QuotationDetailsDrawer";
import { quotationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Quotation } from "@/types";
import Link from "next/link";

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
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await quotationsApi.getAll();
      if (response.success && response.data) {
        setQuotations(response.data.quotations || []);
      } else {
        toast.error("Failed to load quotations");
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("An error occurred while fetching quotations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await quotationsApi.accept(id);
      if (response.success) {
        toast.success("Quotation approved successfully!");
        fetchQuotations();
        if (selectedQuotation?.id === id) {
          setIsDrawerOpen(false);
        }
      } else {
        toast.error(response.message || "Failed to approve quotation");
      }
    } catch (error) {
      toast.error("Error approving quotation");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await quotationsApi.reject(id);
      if (response.success) {
        toast.success("Quotation rejected");
        fetchQuotations();
        if (selectedQuotation?.id === id) {
          setIsDrawerOpen(false);
        }
      } else {
        toast.error(response.message || "Failed to reject quotation");
      }
    } catch (error) {
      toast.error("Error rejecting quotation");
    }
  };

  const handleDownload = (id: string) => {
    toast.info("Generating PDF... Download will start shortly.");
    // In a real app, this would trigger a file download from the server
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (q.orderId && q.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesType = typeFilter === "all" || q.productType?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout title="Quotations">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <FileText className="h-6 w-6 text-blue-400" />
              </span>
              Quotations
            </h2>
            <p className="mt-2 text-zinc-400">
              Review and approve your fabrication estimates, material breakdowns, and labor costs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              className="bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 h-11 w-11 rounded-xl transition-all"
              onClick={fetchQuotations}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/dashboard/design/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 group">
                <Plus className="h-4 w-4 mr-2" />
                New Design
                <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <QuotationsOverviewCards />
        </motion.div>

        {/* Filters and Table */}
        <motion.div variants={itemVariants} className="space-y-4">
          <QuotationsSearchFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="mt-4 text-zinc-400 font-medium">Loading your quotations...</p>
            </div>
          ) : quotations.length === 0 ? (
            <EmptyQuotationState />
          ) : (
            <QuotationsTable 
              quotations={filteredQuotations}
              onViewDetails={(q) => {
                setSelectedQuotation(q);
                setIsDrawerOpen(true);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              onDownload={handleDownload}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Details Drawer */}
      {selectedQuotation && (
        <QuotationDetailsDrawer
          quotation={selectedQuotation}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedQuotation(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDownload={handleDownload}
        />
      )}
    </DashboardLayout>
  );
}
