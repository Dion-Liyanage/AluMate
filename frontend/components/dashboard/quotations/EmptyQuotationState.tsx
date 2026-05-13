"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyQuotationState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 backdrop-blur-md rounded-3xl border border-zinc-800 border-dashed">
      <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700/50 relative group">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
        <FileText className="h-10 w-10 text-zinc-500 group-hover:text-blue-400 transition-colors" />
      </div>
      
      <h3 className="text-xl font-bold text-zinc-100 mb-2">No Quotations Found</h3>
      <p className="text-zinc-400 max-w-sm mb-8">
        You haven't requested any quotations yet. Start by designing your product or requesting a fabrication estimate.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/dashboard/design/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-4 w-4 mr-2" />
            Create New Design
          </Button>
        </Link>
        <Link href="/dashboard/services/measurement">
          <Button variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-11 px-6 transition-all">
            Request Site Visit
          </Button>
        </Link>
      </div>
    </div>
  );
}
