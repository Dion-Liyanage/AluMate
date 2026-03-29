"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { servicesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2, Loader2 } from "lucide-react";

type AvailabilityRecord = {
  date: string;
  slots: string[];
};

export default function AdminServiceAvailabilityPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [slotInput, setSlotInput] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isLoading, router, user]);

  const loadAllRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await servicesApi.getAllAvailability();
      setRecords(response.data?.availability || []);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to load availability records.";
      toast.error(message);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAllRecords();
    }
  }, [user?.role]);

  useEffect(() => {
    const loadDateSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const response = await servicesApi.getAvailabilityConfig(selectedDate);
        setSlots(response.data?.slots || []);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Failed to load slots for selected date.";
        toast.error(message);
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadDateSlots();
  }, [selectedDate]);

  const addSlot = () => {
    const normalized = slotInput.trim();
    if (!normalized) {
      return;
    }

    if (slots.includes(normalized)) {
      toast.error("This slot is already added.");
      return;
    }

    setSlots((prev) => [...prev, normalized]);
    setSlotInput("");
  };

  const removeSlot = (slotToRemove: string) => {
    setSlots((prev) => prev.filter((slot) => slot !== slotToRemove));
  };

  const saveAvailability = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first.");
      return;
    }

    if (slots.length === 0) {
      toast.error("Add at least one time slot before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await servicesApi.upsertAvailability({
        date: selectedDate,
        slots,
      });
      toast.success("Availability saved successfully.");
      await loadAllRecords();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save availability.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const sortedSlots = useMemo(() => [...slots].sort(), [slots]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <DashboardLayout title="Service Availability">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading availability manager...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Service Availability">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-zinc-100">Service Availability</h2>
          <p className="text-zinc-400">
            Configure available dates and time slots for on-site visits.
          </p>
        </div>

        <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-fuchsia-400" />
              Configure Slots
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Pick a date, add slots, then save.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Select Date</p>
              <div className="max-w-sm [&>button]:bg-zinc-900 [&>button]:border-zinc-700 [&>button]:text-zinc-100">
                <DatePicker value={selectedDate} onChange={setSelectedDate} placeholder="Pick a date" />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                placeholder="Add time slot (e.g. 09:00 AM)"
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSlot();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addSlot}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                disabled={!selectedDate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Available Slots</p>
              {isLoadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading slots...
                </div>
              ) : sortedSlots.length === 0 ? (
                <p className="text-sm text-zinc-500">No slots added for this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedSlots.map((slot) => (
                    <Badge
                      key={slot}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-900 text-zinc-200 px-2.5 py-1 flex items-center gap-2"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => removeSlot(slot)}
                        className="text-zinc-500 hover:text-red-400"
                        aria-label={`Remove ${slot}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={saveAvailability}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSaving || !selectedDate || sortedSlots.length === 0}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Availability
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle>Configured Dates</CardTitle>
            <CardDescription className="text-zinc-400">
              Overview of all dates with configured slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading availability records...
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-zinc-500">No availability records found.</p>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.date} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <p className="text-sm font-medium text-zinc-200">{record.date}</p>
                    <p className="text-xs text-zinc-500 mt-1">{record.slots.length} slot(s)</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {record.slots.map((slot) => (
                        <Badge key={`${record.date}-${slot}`} variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
