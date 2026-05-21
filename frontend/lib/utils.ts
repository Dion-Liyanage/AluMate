import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMeasurement(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  if (!str) return "";
  
  // Try to parse feet and inches format: e.g. 5'2" or 4'
  const ftMatch = str.match(/(\d+)'/);
  const inMatch = str.match(/(\d+)"/);
  
  if (ftMatch || inMatch) {
    const ft = ftMatch ? ftMatch[1] : "";
    const inch = inMatch ? inMatch[1] : "";
    
    let formatted = "";
    if (ft) formatted += `${ft} ft`;
    if (inch) {
      formatted += formatted ? ` ${inch} inches` : `${inch} inches`;
    }
    return formatted || str;
  }
  
  return str;
}
