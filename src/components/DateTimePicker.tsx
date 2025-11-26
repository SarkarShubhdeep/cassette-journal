"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Button } from "./ui/button";

interface DateTimePickerProps {
    value: string | null;
    onChange: (value: string) => void;
    onClose?: () => void;
}

export default function DateTimePicker({
    value,
    onChange,
    onClose,
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value ? new Date(value) : undefined,
    );
    const [timeValue, setTimeValue] = useState(
        value
            ? new Date(value).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "00:00",
    );

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTimeValue(e.target.value);
    };

    const handleConfirm = () => {
        if (selectedDate && timeValue) {
            const [hours, minutes] = timeValue.split(":").map(Number);
            const dateTime = new Date(selectedDate);
            dateTime.setHours(hours, minutes, 0, 0);
            onChange(dateTime.toISOString());
            setOpen(false);
            onClose?.();
        }
    };

    const handleCancel = () => {
        setOpen(false);
        onClose?.();
    };

    const getRelativeDate = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateOnly = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );
        const todayOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
        );
        const yesterdayOnly = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
        );
        const tomorrowOnly = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            tomorrow.getDate(),
        );

        if (dateOnly.getTime() === todayOnly.getTime()) {
            return "Today";
        } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
            return "Yesterday";
        } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
            return "Tomorrow";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    const displayValue = value
        ? `${getRelativeDate(new Date(value))}, ${new Date(
              value,
          ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })}`
        : "Pick date & time";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <span className="w-fit cursor-pointer rounded text-xs font-bold text-blue-500 transition-colors">
                    {displayValue}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto rounded-none p-4" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            Time
                        </label>
                        <input
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            className="border-input bg-background w-full border px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-none"
                            size="sm"
                            onClick={handleConfirm}
                            disabled={!selectedDate || !timeValue}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
