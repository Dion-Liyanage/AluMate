"use client";

import { Lightbulb, CheckCircle2 } from "lucide-react";

interface Recommendation {
  material: string;
  reason: string;
}

interface MaterialRecommendationProps {
  recommendations: Recommendation[];
}

export function MaterialRecommendation({ recommendations }: MaterialRecommendationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Why these materials?</h3>
      </div>
      
      <div className="grid gap-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:bg-zinc-900/60 hover:border-amber-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
               <Lightbulb className="w-12 h-12 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <CheckCircle2 className="h-3 w-3 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">{rec.material}</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-8">
                {rec.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 border-dashed">
        <p className="text-[10px] text-zinc-500 font-medium italic">
          * Our intelligent recommendation engine analyzes your environmental data (e.g., wind load, humidity) and usage patterns to suggest these specifications.
        </p>
      </div>
    </div>
  );
}
