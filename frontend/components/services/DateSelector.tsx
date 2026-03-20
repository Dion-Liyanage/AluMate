import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateSelector({ value, onChange }: DateSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Select Date</Label>
      <DatePicker value={value} onChange={onChange} />
    </div>
  );
}
