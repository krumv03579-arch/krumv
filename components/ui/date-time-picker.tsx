import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function DateTimePicker({ value, onChange, placeholder = "날짜·시간 선택" }: DateTimePickerProps) {
  const timeStr = value ? `${pad(value.getHours())}:${pad(value.getMinutes())}` : "09:00";

  function handleDate(d: Date | undefined) {
    if (!d) return;
    const next = new Date(d);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      next.setHours(9, 0, 0, 0);
    }
    onChange(next);
  }

  function handleTime(e: React.ChangeEvent<HTMLInputElement>) {
    const [hh, mm] = e.target.value.split(":").map((n) => Number.parseInt(n, 10));
    const base = value ? new Date(value) : new Date();
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      base.setHours(hh, mm, 0, 0);
      onChange(base);
    }
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("flex-1 justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "yyyy.MM.dd") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleDate}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timeStr}
        onChange={handleTime}
        className="w-[120px]"
        step={60}
      />
    </div>
  );
}