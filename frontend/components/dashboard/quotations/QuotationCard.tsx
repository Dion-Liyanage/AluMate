"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  IndianRupee, 
  ChevronRight, 
  ArrowRight,
  Package,
  Layers
} from "lucide-react";
import { Quotation } from "@/types";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface QuotationCardProps {
  quotation: Quotation;
  onView: (quotation: Quotation) => void;
}

export function QuotationCard({ quotation, onView }: QuotationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">
                #{quotation.id.slice(-8).toUpperCase()}
              </p>
              <h4 className="text-sm font-bold text-zinc-100 capitalize">
                {quotation.productType || "Standard Fabrication"}
              </h4>
            </div>
          </div>
          <QuotationStatusBadge status={quotation.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Layers className="h-3 w-3" /> Design
            </p>
            <p className="text-xs text-zinc-300 font-medium">Custom Design</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date
            </p>
            <p className="text-xs text-zinc-300 font-medium">
              {quotation.createdAt ? format(new Date(quotation.createdAt), 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-zinc-800/50 pt-4">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Estimated Total</p>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-blue-400" />
              <span className="text-xl font-black text-zinc-100">
                {quotation.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
          <Button 
            onClick={() => onView(quotation)}
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-10 px-4 rounded-xl font-bold group/btn"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
