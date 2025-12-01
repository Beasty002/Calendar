import React, { type JSX } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isToday, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarEvent } from "../types/calendar";

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    onDateClick: (date: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDateClick, onEventClick }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            const currentDay = day;
            const dayEvents = events.filter(
                (event) => isSameDay(event.date, currentDay)
            );

            const MAX_EVENTS = 3;
            const visibleEvents = dayEvents.slice(0, MAX_EVENTS);
            const overflowCount = dayEvents.length - MAX_EVENTS;

            days.push(
                <div 
                    key={currentDay.toString()} 
                    className="border p-1 h-32 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors relative group"
                    onClick={() => onDateClick(currentDay)}
                >
                    <div className="flex justify-between items-start">
                        <span
                            className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                                isToday(currentDay) 
                                    ? "bg-blue-500 text-white" 
                                    : "text-gray-700"
                            }`}
                        >
                            {format(currentDay, "d")}
                        </span>
                    </div>

                    {/* Events */}
                    <div className="flex flex-col mt-1 gap-1 overflow-hidden">
                        {visibleEvents.map((event) => (
                            <div
                                key={event.id}
                                className={`text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-90`}
                                style={{ backgroundColor: event.color || "blue" }}
                                title={event.title}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick?.(event);
                                }}
                            >
                                {event.title}
                            </div>
                        ))}
                        {overflowCount > 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div 
                                        className="text-xs text-gray-500 font-medium pl-1 cursor-pointer hover:text-gray-700 hover:bg-gray-200 rounded px-1 w-fit"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        +{overflowCount} more
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-2">
                                    <h4 className="font-semibold mb-1">More Events:</h4>
                                    {dayEvents.slice(MAX_EVENTS).map((event) => (
                                        <div
                                            key={event.id}
                                            className={`text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-90 mb-1`}
                                            style={{ backgroundColor: event.color || "blue" }}
                                            title={event.title}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick?.(event);
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            );

            day = addDays(day, 1);
        }
        rows.push(
            <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
                {days}
            </div>
        );
        days = [];
    }

    // Weekday headers
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="h-full overflow-auto bg-white">
            <div className="min-w-[800px] flex flex-col h-full">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1 bg-white z-30 sticky top-0 px-4 pt-4 pb-2 border-b">
                    {weekdays.map((day) => (
                        <div key={day} className="text-center font-semibold text-sm text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 px-4 pb-4">
                    {rows}
                </div>
            </div>
        </div>
    );
};
