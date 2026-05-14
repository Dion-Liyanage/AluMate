"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Eye, 
  IndianRupee, 
  Calendar, 
  Layers, 
  ArrowRight
} from "lucide-react";
import { Quotation } from "@/types";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface QuotationTableProps {
  quotations: Quotation[];
  onViewDetails: (quotation: Quotation) => void;
}

export function QuotationTable({ 
  quotations, 
  onViewDetails
}: QuotationTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/50">
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Quote ID</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Product</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Design Type</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Estimated Total</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Status</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Generated Date</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4">Expiry Date</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((q) => (
            <TableRow 
              key={q.id} 
              className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group cursor-pointer"
              onClick={() => onViewDetails(q)}
            >
              <TableCell className="py-4">
                <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-blue-400 transition-colors">
                  #{q.id.slice(-8).toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-200 capitalize">
                    {q.productType || "Standard Fabrication"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Layers className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Custom Design</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-sm font-black text-zinc-100">
                    {q.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <QuotationStatusBadge status={q.status} />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                  {q.createdAt ? format(new Date(q.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {q.validUntil ? format(new Date(q.validUntil), 'MMM dd, yyyy') : 'N/A'}
                </div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-zinc-800/50 hover:bg-blue-600 hover:text-white text-zinc-400 rounded-xl h-9 px-4 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(q);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
