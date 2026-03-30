"use client";

import * as React from "react";
import { format, parse, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disablePastDates?: boolean;
  allowedDates?: string[];
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
  disablePastDates = false,
  allowedDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const today = startOfDay(new Date());
  const allowedDateSet = React.useMemo(
    () => new Set(allowedDates ?? []),
    [allowedDates]
  );

  const isDayDisabled = (day: Date) => {
    if (disablePastDates && day < today) {
      return true;
    }

    if (allowedDates) {
      return !allowedDateSet.has(format(day, "yyyy-MM-dd"));
    }

    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, "yyyy-MM-dd"));
            } else {
              onChange("");
            }
            setOpen(false);
          }}
          defaultMonth={date}
          fromDate={disablePastDates ? today : undefined}
          disabled={isDayDisabled}
          fromYear={2000}
          toYear={2030}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
