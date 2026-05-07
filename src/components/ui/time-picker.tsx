"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Input } from "./input";

interface TimePickerProps {
  value?: string; // Format: "HH:MM" (24-hour format)
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  format?: "12" | "24"; // 12-hour or 24-hour format
}

function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  format = "24",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = React.useState<number | null>(
    null,
  );
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);

  // Parse the value prop to set initial state
  React.useEffect(() => {
    if (value) {
      const [hourStr, minuteStr] = value.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (format === "12") {
        if (hour === 0) {
          setSelectedHour(12);
          setPeriod("AM");
        } else if (hour < 12) {
          setSelectedHour(hour);
          setPeriod("AM");
        } else if (hour === 12) {
          setSelectedHour(12);
          setPeriod("PM");
        } else {
          setSelectedHour(hour - 12);
          setPeriod("PM");
        }
      } else {
        setSelectedHour(hour);
      }
      setSelectedMinute(minute);
    }
  }, [value, format]);

  // Scroll to selected values when popover opens
  React.useEffect(() => {
    if (open && selectedHour !== null && selectedMinute !== null) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Scroll hour into view
        const hourElement = hourScrollRef.current?.querySelector(
          `[data-hour="${selectedHour}"]`,
        );
        if (hourElement) {
          hourElement.scrollIntoView({ block: "center", behavior: "smooth" });
        }

        // Scroll minute into view
        const minuteElement = minuteScrollRef.current?.querySelector(
          `[data-minute="${selectedMinute}"]`,
        );
        if (minuteElement) {
          minuteElement.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 100);
    }
  }, [open, selectedHour, selectedMinute]);

  // Generate hours array based on format
  const hours = React.useMemo(() => {
    if (format === "12") {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [format]);

  // Generate minutes array (0-59)
  const minutes = React.useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i);
  }, []);

  // Format display value
  const displayValue = React.useMemo(() => {
    if (selectedHour === null || selectedMinute === null) return "";

    const hour = selectedHour;
    if (format === "12") {
      const suffix = period;
      return `${hour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")} ${suffix}`;
    }
    return `${hour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
  }, [selectedHour, selectedMinute, period, format]);

  // Handle time selection
  const handleTimeSelect = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);

    // Convert to 24-hour format for the onChange callback
    let finalHour = hour;
    if (format === "12") {
      if (period === "AM" && hour === 12) {
        finalHour = 0;
      } else if (period === "PM" && hour !== 12) {
        finalHour = hour + 12;
      }
    }

    const timeString = `${finalHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    onChange?.(timeString);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative group">
          <Input
            readOnly
            disabled={disabled}
            value={displayValue}
            placeholder={placeholder}
            className={cn(
              "cursor-pointer pr-10 transition-all duration-200",
              "hover:shadow-sm",
              className,
            )}
            onClick={() => !disabled && setOpen(true)}
          />
          <Clock
            className={cn(
              "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
              disabled
                ? "text-gray-400"
                : "text-gray-500 group-hover:text-primary",
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
        align="start"
      >
        <div className="flex">
          {/* Hours Column */}
          <div className="border-r border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-700 border-b border-gray-200 text-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
              Giờ
            </div>
            <ScrollArea className="h-48 w-16" ref={hourScrollRef}>
              <div className="p-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    data-hour={hour}
                    onClick={() => {
                      setSelectedHour(hour);
                      if (selectedMinute !== null) {
                        handleTimeSelect(hour, selectedMinute);
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm transition-all duration-200 rounded-md",
                      "hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm",
                      selectedHour === hour
                        ? "bg-primary text-white font-medium shadow-md hover:bg-primary hover:text-white hover:scale-100"
                        : "hover:font-medium",
                    )}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Minutes Column */}
          <div className={format === "12" ? "border-r border-gray-200" : ""}>
            <div className="p-3 text-sm font-medium text-gray-700 border-b border-gray-200 text-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
              Phút
            </div>
            <ScrollArea className="h-48 w-16" ref={minuteScrollRef}>
              <div className="p-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    data-minute={minute}
                    onClick={() => {
                      setSelectedMinute(minute);
                      if (selectedHour !== null) {
                        handleTimeSelect(selectedHour, minute);
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm transition-all duration-200 rounded-md",
                      "hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm",
                      selectedMinute === minute
                        ? "bg-primary text-white font-medium shadow-md hover:bg-primary hover:text-white hover:scale-100"
                        : "hover:font-medium",
                    )}
                  >
                    {minute.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* AM/PM Column (only for 12-hour format) */}
          {format === "12" && (
            <div>
              <div className="p-3 text-sm font-medium text-gray-700 border-b border-gray-200 text-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                Buổi
              </div>
              <div className="p-1">
                {["AM", "PM"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p as "AM" | "PM");
                      if (selectedHour !== null && selectedMinute !== null) {
                        // Recalculate and trigger onChange with new period
                        let finalHour = selectedHour;
                        if (p === "AM" && selectedHour === 12) {
                          finalHour = 0;
                        } else if (p === "PM" && selectedHour !== 12) {
                          finalHour = selectedHour + 12;
                        }
                        const timeString = `${finalHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
                        onChange?.(timeString);
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm transition-all duration-200 rounded-md mb-1",
                      "hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm",
                      period === p
                        ? "bg-primary text-white font-medium shadow-md hover:bg-primary hover:text-white hover:scale-100"
                        : "hover:font-medium",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker };
