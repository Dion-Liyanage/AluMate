"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { servicesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  ArrowLeft,
  Clock3,
  History,
} from "lucide-react";

type AvailabilityRecord = {
  date: string;
  slots: string[];
};

export default function AdminServiceAvailabilityPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [slotTimeInput, setSlotTimeInput] = useState("");
  const [slotPeriod, setSlotPeriod] = useState<"AM" | "PM">("AM");
  const [slots, setSlots] = useState<string[]>([]);

  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [draftSlotsByDate, setDraftSlotsByDate] = useState<Record<string, string[]>>({});
  const [editingRecordSlot, setEditingRecordSlot] = useState<{
    date: string;
    index: number;
    timeInput: string;
    period: "AM" | "PM";
  } | null>(null);
  const [addingSlotDate, setAddingSlotDate] = useState<string | null>(null);
  const [newRecordTimeInput, setNewRecordTimeInput] = useState("");
  const [newRecordPeriod, setNewRecordPeriod] = useState<"AM" | "PM">("AM");

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [updatingDate, setUpdatingDate] = useState<string | null>(null);
  const [deletingRecordDate, setDeletingRecordDate] = useState<string | null>(null);
  const [editingDateLabel, setEditingDateLabel] = useState<string | null>(null);
  const [tempDateValue, setTempDateValue] = useState<string | undefined>(undefined);
  const [draftDatesByOriginalDate, setDraftDatesByOriginalDate] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isLoading, router, user]);

  const formatSlot = (rawTime: string, period: "AM" | "PM"): string | null => {
    const normalized = rawTime.trim().replace(".", ":");
    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?$/);

    if (!match) {
      return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2] ?? "00");

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }

    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const splitSlot = (slot: string): { time: string; period: "AM" | "PM" } => {
    const match = slot.match(/^(\d{2}:\d{2})\s(AM|PM)$/);
    if (!match) {
      return { time: "", period: "AM" };
    }
    return { time: match[1], period: match[2] as "AM" | "PM" };
  };

  const compareTimeSlots = (a: string, b: string) => {
    const getMinutes = (slot: string) => {
      const { time, period } = splitSlot(slot);
      if (!time) return 0;
      const [h, m] = time.split(":").map(Number);
      const adjustedHour =
        period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
      return adjustedHour * 60 + m;
    };
    return getMinutes(a) - getMinutes(b);
  };

  const loadAllRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await servicesApi.getAllAvailability();
      const fetchedRecords = response.data?.availability || [];
      // Ensure all incoming records have sorted slots
      const sortedRecords = fetchedRecords.map((r: AvailabilityRecord) => ({
        ...r,
        slots: [...r.slots].sort(compareTimeSlots),
      }));
      setRecords(sortedRecords);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to load availability records.";
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
        const message =
          error?.response?.data?.message || "Failed to load slots for selected date.";
        toast.error(message);
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadDateSlots();
  }, [selectedDate]);

  const addSlot = () => {
    const formattedSlot = formatSlot(slotTimeInput, slotPeriod);
    if (!formattedSlot) {
      toast.error("Enter time as HH:MM (or HH) and choose AM/PM.");
      return;
    }

    if (slots.includes(formattedSlot)) {
      toast.error("This slot is already added.");
      return;
    }

    setSlots((prev) => [...prev, formattedSlot]);
    setSlotTimeInput("");
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

  const getSlotsForRecord = (record: AvailabilityRecord): string[] => {
    return draftSlotsByDate[record.date] ?? record.slots;
  };

  const getDisplayDateForRecord = (record: AvailabilityRecord): string => {
    return draftDatesByOriginalDate[record.date] ?? record.date;
  };

  const hasRecordDateChanges = (record: AvailabilityRecord): boolean => {
    return !!draftDatesByOriginalDate[record.date];
  };

  const hasRecordChanges = (record: AvailabilityRecord): boolean => {
    const slotsChanged = JSON.stringify(getSlotsForRecord(record)) !== JSON.stringify(record.slots);
    const dateChanged = hasRecordDateChanges(record);
    return slotsChanged || dateChanged;
  };

  const setRecordDraftSlots = (
    date: string,
    updater: (prev: string[]) => string[],
  ) => {
    setDraftSlotsByDate((prev) => {
      const base = prev[date] ?? records.find((item) => item.date === date)?.slots ?? [];
      const updated = updater(base);
      return {
        ...prev,
        [date]: [...updated].sort(compareTimeSlots),
      };
    });
  };

  const startEditingRecordSlot = (date: string, index: number, slot: string) => {
    const parsed = splitSlot(slot);
    setEditingRecordSlot({
      date,
      index,
      timeInput: parsed.time,
      period: parsed.period,
    });
  };

  const cancelEditingRecordSlot = () => {
    setEditingRecordSlot(null);
  };

  const saveEditedRecordSlot = () => {
    if (!editingRecordSlot) {
      return;
    }

    const formattedSlot = formatSlot(
      editingRecordSlot.timeInput,
      editingRecordSlot.period,
    );
    if (!formattedSlot) {
      toast.error("Enter time as HH:MM (or HH) and choose AM/PM.");
      return;
    }

    const record = records.find((item) => item.date === editingRecordSlot.date);
    if (!record) {
      return;
    }

    const current = getSlotsForRecord(record);
    const duplicate = current.some(
      (slot, index) => slot === formattedSlot && index !== editingRecordSlot.index,
    );
    if (duplicate) {
      toast.error("This slot is already added.");
      return;
    }

    setRecordDraftSlots(editingRecordSlot.date, (prev) =>
      prev.map((slot, index) =>
        index === editingRecordSlot.index ? formattedSlot : slot,
      ),
    );
    cancelEditingRecordSlot();
  };

  const removeRecordSlot = (date: string, index: number) => {
    setRecordDraftSlots(date, (prev) => prev.filter((_, i) => i !== index));
  };

  const startAddingRecordSlot = (date: string) => {
    setAddingSlotDate(date);
    setNewRecordTimeInput("");
    setNewRecordPeriod("AM");
  };

  const cancelAddingRecordSlot = () => {
    setAddingSlotDate(null);
    setNewRecordTimeInput("");
    setNewRecordPeriod("AM");
  };

  const startEditingDateLabel = (date: string) => {
    setEditingDateLabel(date);
    // Initialize with the drafted date if it exists, otherwise the original date
    const currentDisplayDate = draftDatesByOriginalDate[date] ?? date;
    setTempDateValue(currentDisplayDate);
  };

  const cancelEditingDateLabel = () => {
    setEditingDateLabel(null);
    setTempDateValue(undefined);
  };

  const saveEditedDateLabel = async (oldDate: string) => {
    if (!tempDateValue) {
      toast.error("Please pick a date.");
      return;
    }

    if (tempDateValue === oldDate) {
      setDraftDatesByOriginalDate((prev) => {
        const next = { ...prev };
        delete next[oldDate];
        return next;
      });
      cancelEditingDateLabel();
      return;
    }

    // Check if target date already exists in records (unless it's the current date of ANOTHER record)
    if (records.some((r) => r.date === tempDateValue && r.date !== oldDate)) {
      toast.error(`A configuration for ${tempDateValue} already exists.`);
      return;
    }

    // Store as draft instead of calling API immediately
    setDraftDatesByOriginalDate((prev) => ({
      ...prev,
      [oldDate]: tempDateValue,
    }));
    cancelEditingDateLabel();
  };

  const addRecordSlot = (date: string) => {
    const formattedSlot = formatSlot(newRecordTimeInput, newRecordPeriod);
    if (!formattedSlot) {
      toast.error("Enter time as HH:MM (or HH) and choose AM/PM.");
      return;
    }

    const record = records.find((item) => item.date === date);
    if (!record) {
      return;
    }

    const current = getSlotsForRecord(record);
    if (current.includes(formattedSlot)) {
      toast.error("This slot is already added.");
      return;
    }

    setRecordDraftSlots(date, (prev) => [...prev, formattedSlot]);
    cancelAddingRecordSlot();
  };

  const updateRecordSlots = async (record: AvailabilityRecord) => {
    const slots = getSlotsForRecord(record);
    const oldDate = record.date;
    const newDraftDate = draftDatesByOriginalDate[oldDate];
    const isDateChange = !!newDraftDate;
    const finalDate = newDraftDate ?? oldDate;

    if (slots.length === 0) {
      toast.error("At least one slot is required. Use Delete to remove this date.");
      return;
    }

    setUpdatingDate(oldDate);
    try {
      if (isDateChange) {
        // Migration: Create on new date, then delete old date
        await servicesApi.upsertAvailability({
          date: finalDate,
          slots,
        });
        await servicesApi.deleteAvailability(oldDate);
        toast.success(`Availability moved from ${oldDate} to ${finalDate}`);
      } else {
        // Simple update for current date
        await servicesApi.upsertAvailability({
          date: oldDate,
          slots,
        });
        toast.success(`Availability for ${oldDate} updated.`);
      }

      await loadAllRecords();
      
      // Cleanup all drafts for this record
      setDraftSlotsByDate((prev) => {
        const next = { ...prev };
        delete next[oldDate];
        return next;
      });
      setDraftDatesByOriginalDate((prev) => {
        const next = { ...prev };
        delete next[oldDate];
        return next;
      });

      if (addingSlotDate === oldDate) {
        cancelAddingRecordSlot();
      }
      if (editingRecordSlot?.date === oldDate) {
        cancelEditingRecordSlot();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update availability.";
      toast.error(message);
    } finally {
      setUpdatingDate(null);
    }
  };

  const deleteRecord = async (date: string) => {
    setDeletingRecordDate(date);
    try {
      await servicesApi.deleteAvailability(date);
      toast.success("Availability deleted successfully.");
      await loadAllRecords();
      setDraftSlotsByDate((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      if (selectedDate === date) {
        setSlots([]);
      }
      if (addingSlotDate === date) {
        cancelAddingRecordSlot();
      }
      if (editingRecordSlot?.date === date) {
        cancelEditingRecordSlot();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete availability.";
      toast.error(message);
    } finally {
      setDeletingRecordDate(null);
    }
  };

  const sortedSlots = useMemo(
    () => [...slots].sort(compareTimeSlots),
    [slots],
  );

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-zinc-100">Service Availability</h2>
            <p className="text-zinc-400">
              Configure available dates and time slots for on-site visits.
            </p>
          </div>
          <Link href="/admin/services">
            <Button 
              className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40 hover:text-fuchsia-100 hover:bg-fuchsia-500/30 hover:border-fuchsia-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(217,70,239,0.1)]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
          {/* Main palette tint (Fuchsia + Pink + Rose) while keeping dark base */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/8 via-pink-500/8 to-rose-500/8 pointer-events-none" />

          {/* Dark depth layer to match previous darker look */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />

          {/* Wave shimmer effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />

          {/* Decorative background icon */}
          <div className="absolute top-[30%] -translate-y-1/2 right-12 opacity-[0.15] pointer-events-none group-hover:opacity-[0.2] transition-opacity">
            <CalendarDays className="w-40 h-40 text-fuchsia-300" />
          </div>

          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-fuchsia-400" />
              Configure Slots
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Pick a date, add slots, then save.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-2">
              <div className="max-w-sm [&>button]:bg-zinc-900 [&>button]:border-zinc-700 [&>button]:text-zinc-100">
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="Pick a date"
                  disablePastDates
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full max-w-sm">
                <div className="grid grid-cols-[1fr_110px] gap-2">
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      value={slotTimeInput}
                      onChange={(e) => setSlotTimeInput(e.target.value)}
                      placeholder="Add a time (e.g. 9.00)"
                      className="w-full bg-zinc-900 border-zinc-700 pl-10 text-zinc-100"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSlot();
                        }
                      }}
                    />
                  </div>
                  <Select value={slotPeriod} onValueChange={(value: "AM" | "PM") => setSlotPeriod(value)}>
                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                onClick={addSlot}
                className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40 hover:text-fuchsia-100 hover:bg-fuchsia-500/30 hover:border-fuchsia-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(217,70,239,0.1)]"
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
              className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              disabled={isSaving || !selectedDate || sortedSlots.length === 0}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Availability
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-fuchsia-400" />
              Configured Dates and Times
            </CardTitle>
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
                {records.map((record) => {
                  const currentSlots = getSlotsForRecord(record);
                  const isDirty = hasRecordChanges(record);

                  return (
                    <div key={record.date} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 pl-1">
                          {editingDateLabel === record.date ? (
                            <div className="flex items-center gap-2">
                              <div className="w-40 [&>button]:bg-zinc-800 [&>button]:border-zinc-700 [&>button]:text-zinc-100">
                                <DatePicker
                                  value={tempDateValue}
                                  onChange={setTempDateValue}
                                  placeholder="Pick a date"
                                  disablePastDates
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => saveEditedDateLabel(record.date)}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingDateLabel}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/date">
                              <p className="text-sm font-medium text-zinc-200">
                                {getDisplayDateForRecord(record)}
                              </p>
                              <button
                                type="button"
                                onClick={() => startEditingDateLabel(record.date)}
                                className="text-zinc-500 hover:text-fuchsia-400 transition-colors"
                                aria-label={`Edit date ${record.date}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-zinc-500 mt-1">{currentSlots.length} slot(s)</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-6 px-2.5 bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-all text-[10px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            onClick={() => updateRecordSlots(record)}
                            disabled={!isDirty || updatingDate === record.date || deletingRecordDate === record.date}
                            aria-label={`Update ${record.date}`}
                          >
                            {updatingDate === record.date ? (
                              <>
                                <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                                Updating...
                              </>
                            ) : (
                              "Update"
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 border-zinc-700 bg-zinc-900 text-red-300 hover:bg-zinc-800"
                            onClick={() => deleteRecord(record.date)}
                            disabled={deletingRecordDate === record.date}
                            aria-label={`Delete ${record.date}`}
                          >
                            {deletingRecordDate === record.date ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {currentSlots.map((slot, index) => {
                          const isEditingThisSlot =
                            editingRecordSlot?.date === record.date &&
                            editingRecordSlot?.index === index;

                          if (isEditingThisSlot && editingRecordSlot) {
                            return (
                              <div key={`${record.date}-edit-${index}`} className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1">
                                <Input
                                  value={editingRecordSlot.timeInput}
                                  onChange={(e) =>
                                    setEditingRecordSlot((prev) =>
                                      prev ? { ...prev, timeInput: e.target.value } : prev,
                                    )
                                  }
                                  className="h-8 w-24 bg-zinc-800 border-zinc-700 text-zinc-100"
                                  placeholder="HH:MM"
                                />
                                <Select
                                  value={editingRecordSlot.period}
                                  onValueChange={(value: "AM" | "PM") =>
                                    setEditingRecordSlot((prev) =>
                                      prev ? { ...prev, period: value } : prev,
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 w-20 bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectValue placeholder="AM/PM" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <button
                                  type="button"
                                  onClick={saveEditedRecordSlot}
                                  className="text-emerald-400 hover:text-emerald-300"
                                  aria-label={`Save ${slot}`}
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingRecordSlot}
                                  className="text-zinc-500 hover:text-zinc-300"
                                  aria-label={`Cancel editing ${slot}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <Badge
                              key={`${record.date}-${slot}-${index}`}
                              variant="outline"
                              className="border-zinc-700 bg-zinc-900 text-zinc-200 px-2.5 py-1 flex items-center gap-2"
                            >
                              {slot}
                              <button
                                type="button"
                                onClick={() => startEditingRecordSlot(record.date, index, slot)}
                                className="text-zinc-500 hover:text-zinc-300"
                                aria-label={`Edit ${slot}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRecordSlot(record.date, index)}
                                className="text-zinc-500 hover:text-red-400"
                                aria-label={`Remove ${slot}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </Badge>
                          );
                        })}

                        {addingSlotDate === record.date ? (
                          <div className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1">
                            <Input
                              value={newRecordTimeInput}
                              onChange={(e) => setNewRecordTimeInput(e.target.value)}
                              className="h-8 w-24 bg-zinc-800 border-zinc-700 text-zinc-100"
                              placeholder="HH:MM"
                            />
                            <Select
                              value={newRecordPeriod}
                              onValueChange={(value: "AM" | "PM") => setNewRecordPeriod(value)}
                            >
                              <SelectTrigger className="h-8 w-20 bg-zinc-800 border-zinc-700 text-zinc-100">
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => addRecordSlot(record.date)}
                              className="text-emerald-400 hover:text-emerald-300"
                              aria-label={`Add slot to ${record.date}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelAddingRecordSlot}
                              className="text-zinc-500 hover:text-zinc-300"
                              aria-label={`Cancel adding slot to ${record.date}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => startAddingRecordSlot(record.date)}
                            aria-label={`Add slot to ${record.date}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
