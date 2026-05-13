"use client";

import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface QuotationsSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

export function QuotationsSearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter
}: QuotationsSearchFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="Search by ID or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:ring-blue-500/20 focus:border-blue-500/50 rounded-xl transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mr-2">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-xl focus:ring-blue-500/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-xl focus:ring-blue-500/20">
            <SelectValue placeholder="Product Type" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="window">Window</SelectItem>
            <SelectItem value="door">Door</SelectItem>
            <SelectItem value="pantry">Pantry</SelectItem>
            <SelectItem value="partition">Partition</SelectItem>
            <SelectItem value="cupboard">Cupboard</SelectItem>
            <SelectItem value="railing">Railing</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
