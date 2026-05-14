"use client";

import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, LayoutGrid, FileText } from "lucide-react";

interface QuotationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  designTypeFilter: string;
  setDesignTypeFilter: (type: string) => void;
}

export function QuotationFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  designTypeFilter,
  setDesignTypeFilter
}: QuotationFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="relative w-full lg:w-80 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="Search by ID, product, or design..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:ring-blue-500/20 focus:border-blue-500/50 rounded-xl transition-all h-11"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mr-2">
          <Filter className="h-3 w-3" />
          <span>Quick Filters</span>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-xl focus:ring-blue-500/20 h-11">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-zinc-500" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revision_requested">Revision Requested</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-xl focus:ring-blue-500/20 h-11">
            <SelectValue placeholder="Product Type" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="window">Windows</SelectItem>
            <SelectItem value="door">Doors</SelectItem>
            <SelectItem value="pantry">Pantry</SelectItem>
            <SelectItem value="partition">Partition</SelectItem>
            <SelectItem value="cupboard">Cupboard</SelectItem>
            <SelectItem value="railing">Railings</SelectItem>
          </SelectContent>
        </Select>

        <Select value={designTypeFilter} onValueChange={setDesignTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-xl focus:ring-blue-500/20 h-11">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
              <SelectValue placeholder="Design Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectItem value="all">All Designs</SelectItem>
            <SelectItem value="custom">Custom Design</SelectItem>
            <SelectItem value="catalogue">Catalogue Design</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
