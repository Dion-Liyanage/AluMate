import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { servicesApi } from "@/lib/api";

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedSlot: string;
  onSelect: (slot: string) => void;
}

export function TimeSlotSelector({ selectedDate, selectedSlot, onSelect }: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await servicesApi.getAvailability(selectedDate);
        setSlots(response.data?.slots || []);
      } catch (error) {
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlots();
  }, [selectedDate]);

  if (!selectedDate) {
    return <p className="text-sm text-zinc-500 mt-2">Please select a date first.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500 mt-2">Loading available slots...</p>;
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
