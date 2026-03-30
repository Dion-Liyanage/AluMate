import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  allowedDates?: string[];
}

export function DateSelector({ value, onChange, allowedDates }: DateSelectorProps) {
  return (
    <div className="space-y-2 flex flex-col">
      <Label className="text-zinc-300 mb-1">Select Date</Label>
      <div className="[&>button]:bg-zinc-900/50 [&>button]:border-zinc-800 [&>button]:text-zinc-100 [&>button]:hover:bg-zinc-800">
        <DatePicker
          value={value}
          onChange={onChange}
          disablePastDates
          allowedDates={allowedDates}
        />
      </div>
    </div>
  );
}
