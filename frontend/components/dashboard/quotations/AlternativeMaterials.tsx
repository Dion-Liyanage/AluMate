"use client";

import { Layers, IndianRupee, Zap, Shield, Crown } from "lucide-react";

interface Option {
  id: string;
  type: 'Budget' | 'Standard' | 'Premium';
  material: string;
  estimatedTotal: number;
  isSelected?: boolean;
}

interface AlternativeMaterialsProps {
  options: Option[];
}

export function AlternativeMaterials({ options }: AlternativeMaterialsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Budget': return <Zap className="h-4 w-4 text-emerald-400" />;
      case 'Standard': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'Premium': return <Crown className="h-4 w-4 text-amber-400" />;
      default: return null;
    }
  };

  const getTheme = (type: string) => {
    switch (type) {
      case 'Budget': return 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30';
      case 'Standard': return 'from-blue-500/20 to-blue-600/5 border-blue-500/30';
      case 'Premium': return 'from-amber-500/20 to-amber-600/5 border-amber-500/30';
      default: return 'from-zinc-800 to-zinc-900 border-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Alternative Material Options</h3>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <div 
            key={option.id} 
            className={`relative rounded-2xl border p-4 bg-gradient-to-br transition-all hover:scale-[1.02] cursor-pointer ${
              option.isSelected ? getTheme(option.type) + ' ring-1 ring-offset-2 ring-offset-zinc-950 ring-zinc-700' : 'bg-zinc-900/30 border-zinc-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getIcon(option.type)}
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{option.type}</span>
              </div>
              {option.isSelected && (
                <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>
            
            <h4 className="text-xs font-bold text-zinc-100 mb-4 line-clamp-2 min-h-[2rem]">
              {option.material}
            </h4>
            
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Est.</span>
              <IndianRupee className="h-3 w-3 text-zinc-400" />
              <span className="text-lg font-black text-zinc-100">
                {option.estimatedTotal.toLocaleString()}
              </span>
            </div>
            
            {option.isSelected && (
              <p className="mt-2 text-[9px] text-zinc-400 font-medium">Currently Selected</p>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-zinc-500 text-center italic">
        Need to change your option? <span className="text-blue-400 cursor-pointer hover:underline">Request a modification</span>
      </p>
    </div>
  );
}
