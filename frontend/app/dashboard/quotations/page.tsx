"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuotationsOverviewCards } from "@/components/dashboard/quotations/QuotationsOverviewCards";
import { QuotationFilters } from "@/components/dashboard/quotations/QuotationFilters";
import { QuotationTable } from "@/components/dashboard/quotations/QuotationTable";
import { QuotationCard } from "@/components/dashboard/quotations/QuotationCard";
import { EmptyQuotationState } from "@/components/dashboard/quotations/EmptyQuotationState";
import { QuotationDetailsDrawer } from "@/components/dashboard/quotations/QuotationDetailsDrawer";
import { quotationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Quotation } from "@/types";

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
  const [designTypeFilter, setDesignTypeFilter] = useState("all");
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
                         (q.productType && q.productType.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesType = typeFilter === "all" || q.productType?.toLowerCase() === typeFilter.toLowerCase();
    
    // For now, mock design type since it's not in the base Quotation type
    const matchesDesignType = designTypeFilter === "all" || "custom" === designTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesDesignType;
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
        <motion.div variants={itemVariants}>
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <FileText className="h-6 w-6 text-blue-400" />
              </span>
              Quotations
            </h2>
            <p className="mt-2 text-zinc-400">
              Review, compare, and approve your fabrication quotations.
            </p>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <QuotationsOverviewCards />
        </motion.div>

        {/* Filters and Table/Cards */}
        <motion.div variants={itemVariants} className="space-y-4">
          <QuotationFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            designTypeFilter={designTypeFilter}
            setDesignTypeFilter={setDesignTypeFilter}
          />

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="mt-4 text-zinc-400 font-medium">Loading your quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <EmptyQuotationState />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden lg:block">
                <QuotationTable 
                  quotations={filteredQuotations}
                  onViewDetails={(q) => {
                    setSelectedQuotation(q);
                    setIsDrawerOpen(true);
                  }}
                />
              </div>

              {/* Mobile/Tablet View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {filteredQuotations.map((q) => (
                  <QuotationCard 
                    key={q.id} 
                    quotation={q} 
                    onView={(q) => {
                      setSelectedQuotation(q);
                      setIsDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
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
