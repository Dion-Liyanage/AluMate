"use client";

import { useState } from "react";
import { 
  FileText, 
  Eye, 
  Download, 
  Check, 
  X,
  MoreVertical,
  Calendar,
  IndianRupee
} from "lucide-react";
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
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { format } from "date-fns";
import { Quotation } from "@/types";

interface QuotationsTableProps {
  quotations: Quotation[];
  onViewDetails: (quotation: Quotation) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDownload: (id: string) => void;
}

export function QuotationsTable({
  quotations,
  onViewDetails,
  onApprove,
  onReject,
  onDownload
}: QuotationsTableProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-2xl">
      <Table>
        <TableHeader className="bg-zinc-950/50">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-semibold py-4">Quotation ID</TableHead>
            <TableHead className="text-zinc-400 font-semibold">Product Type</TableHead>
            <TableHead className="text-zinc-400 font-semibold">Amount</TableHead>
            <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
            <TableHead className="text-zinc-400 font-semibold">Created Date</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                No quotations found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            quotations.map((quotation) => (
              <TableRow 
                key={quotation.id} 
                className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">
                        #{quotation.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium tracking-wider">
                        ORDER: {quotation.orderId?.slice(-8).toUpperCase() || "N/A"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-300 font-medium capitalize">
                    {quotation.productType || "Standard"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-emerald-400 font-bold">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {quotation.totalAmount?.toLocaleString() || "0.00"}
                  </div>
                </TableCell>
                <TableCell>
                  <QuotationStatusBadge status={quotation.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {quotation.createdAt ? format(new Date(quotation.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      onClick={() => onViewDetails(quotation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
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
                        <DropdownMenuItem 
                          onClick={() => onViewDetails(quotation)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer rounded-md"
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDownload(quotation.id)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer rounded-md"
                        >
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        {(quotation.status === 'pending' || quotation.status === 'pending_approval') && (
                          <>
                            <div className="h-px bg-zinc-800 my-1" />
                            <DropdownMenuItem 
                              onClick={() => onApprove(quotation.id)}
                              className="text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer rounded-md font-medium"
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve Quotation
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onReject(quotation.id)}
                              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer rounded-md font-medium"
                            >
                              <X className="h-4 w-4 mr-2" /> Reject Quotation
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
