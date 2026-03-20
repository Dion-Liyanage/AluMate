import { Button } from "@/components/ui/button";

export const availableSlots = [
  {
    date: "2026-03-20",
    slots: ["09:00 AM", "11:00 AM", "02:00 PM"]
  },
  {
    date: "2026-03-21",
    slots: ["10:00 AM", "01:00 PM", "04:00 PM"]
  }
];

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedSlot: string;
  onSelect: (slot: string) => void;
}

export function TimeSlotSelector({ selectedDate, selectedSlot, onSelect }: TimeSlotSelectorProps) {
  const dateSlots = availableSlots.find(s => s.date === selectedDate);
  const slots = dateSlots ? dateSlots.slots : [];

  if (!selectedDate) {
    return <p className="text-sm text-zinc-500 mt-2">Please select a date first.</p>;
  }

  if (slots.length === 0) {
    return <p className="text-sm text-zinc-500 mt-2">No slots available for this date.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {slots.map(slot => (
        <Button
          key={slot}
          type="button"
          variant="outline"
          className={
            selectedSlot === slot 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30 hover:text-emerald-300"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          }
          onClick={() => onSelect(slot)}
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}
