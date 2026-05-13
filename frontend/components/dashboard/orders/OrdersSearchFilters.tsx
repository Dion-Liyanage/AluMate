"use client";

import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function OrdersSearchFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="Search by Order ID, Product Type..."
          className="pl-10 bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select>
          <SelectTrigger className="w-[140px] bg-zinc-950/50 border-zinc-800">
            <Filter className="h-4 w-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="production">In Production</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[140px] bg-zinc-950/50 border-zinc-800">
            <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="window">Window</SelectItem>
            <SelectItem value="door">Door</SelectItem>
            <SelectItem value="pantry">Pantry</SelectItem>
            <SelectItem value="partition">Partition</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="bg-zinc-950/50 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 ml-auto md:ml-0">
          Reset
        </Button>
      </div>
    </div>
  );
}
