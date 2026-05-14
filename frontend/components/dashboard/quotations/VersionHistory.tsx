"use client";

import { History, ArrowRight, IndianRupee, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Revision {
  version: number;
  totalAmount: number;
  date: string;
  changes: string;
  isCurrent?: boolean;
}

interface VersionHistoryProps {
  revisions: Revision[];
}

export function VersionHistory({ revisions }: VersionHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <History className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Quotation Revision History</h3>
      </div>
      
      <div className="space-y-3">
        {revisions.map((rev, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              rev.isCurrent 
                ? 'bg-zinc-800/50 border-indigo-500/30' 
                : 'bg-zinc-900/20 border-zinc-800 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                rev.isCurrent ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}>
                V{rev.version}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-200">
                    {rev.isCurrent ? 'Current Estimate' : 'Previous Revision'}
                  </span>
                  {rev.isCurrent && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full uppercase font-black">Active</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {format(new Date(rev.date), 'MMM dd, yyyy')}
                  </span>
                  <span>•</span>
                  <span>{rev.changes}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                <IndianRupee className="h-3 w-3 text-zinc-400" />
                <span className={`text-lg font-black ${rev.isCurrent ? 'text-zinc-100' : 'text-zinc-500'}`}>
                  {rev.totalAmount.toLocaleString()}
                </span>
              </div>
              <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto">
                Compare <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
