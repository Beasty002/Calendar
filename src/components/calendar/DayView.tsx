import React, { Fragment } from "react";
import { format, isSameDay } from "date-fns";
import type { CalendarEvent } from "../types/calendar";
import { SLOT_DURATION } from "@/lib/constants";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DayViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    onDateClick: (date: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 60; // px per hour

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
}) => {
    const hours = Array.from({ length: 24 }).map((_, i) => i);

    // Events for the current day
    const dayEvents = events.filter((event) => isSameDay(event.date, currentDate));

    // Overlap Logic
    // 1. Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });

    // 2. Group overlapping events
    const getMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const positionedEvents = sortedEvents.map((event) => {
        const startMin = getMinutes(event.startTime);
        const endMin = startMin + SLOT_DURATION;
        return { ...event, startMin, endMin };
    });

    // Simple overlap detection: if events share the same start time, they overlap (for this specific requirement)
    // The user said: "i receive 9:00 for particular date like that i can even recieve same time slots booked to too"
    // So we group by startTime.
    const eventsByTime: Record<string, typeof positionedEvents> = {};
    positionedEvents.forEach(event => {
        if (!eventsByTime[event.startTime]) {
            eventsByTime[event.startTime] = [];
        }
        eventsByTime[event.startTime].push(event);
    });

    return (
        <div className="h-full overflow-auto bg-white">
            <div className="min-w-[500px] flex flex-col">
                {/* Header */}
                <div className="text-center mb-2 font-semibold text-lg flex-none sticky top-0 bg-white z-30 px-4 pt-4 pb-2 border-b">
                    {format(currentDate, "EEEE, MMMM d")}
                </div>

                <div className="flex flex-1 relative px-4 pt-2">
                    {/* Time Labels Column */}
                    <div className="w-12 flex-none border-r border-gray-200">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] text-xs text-gray-500 flex items-center justify-center border-b border-gray-100"
                            >
                                {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                            </div>
                        ))}
                    </div>

                    {/* Event Grid Column */}
                    <div className="flex-1 relative">
                        {/* Grid Lines */}
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] border-b border-gray-100 w-full absolute"
                                style={{ top: `${hour * 60}px` }}
                                onClick={() => {
                                    const dateWithTime = new Date(currentDate);
                                    dateWithTime.setHours(hour, 0, 0, 0);
                                    onDateClick(dateWithTime);
                                }}
                            />
                        ))}

                        {/* Events */}
                        {Object.values(eventsByTime).map((group) => {
                            const MAX_VISIBLE_EVENTS = 5;
                            const hasOverflow = group.length > MAX_VISIBLE_EVENTS;
                            const visibleEvents = hasOverflow ? group.slice(0, MAX_VISIBLE_EVENTS - 1) : group;
                            const overflowCount = group.length - (MAX_VISIBLE_EVENTS - 1);
                            
                            const slotCount = hasOverflow ? MAX_VISIBLE_EVENTS : group.length;
                            const widthPercent = 100 / slotCount;
                            
                            return (
                                <Fragment key={group[0].startTime}>
                                    {visibleEvents.map((event, index) => {
                                        const top = (event.startMin / 60) * HOUR_HEIGHT;
                                        const height = (SLOT_DURATION / 60) * HOUR_HEIGHT;
                                        const left = `${index * widthPercent}%`;
                                        const width = `${widthPercent}%`;

                                        return (
                                            <div
                                                key={event.id}
                                                className="absolute px-1 rounded text-white text-xs overflow-hidden border-white border-l-2 first:border-l-0 z-10"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left,
                                                    width,
                                                    backgroundColor: event.color || "blue",
                                                }}
                                                title={`${event.title} (${event.startTime})`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick?.(event);
                                                }}
                                            >
                                                {event.title}
                                            </div>
                                        );
                                    })}

                                    {hasOverflow && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="absolute px-1 rounded bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center border-white border-l-2 z-10 cursor-pointer hover:bg-gray-200"
                                                    style={{
                                                        top: `${(group[0].startMin / 60) * HOUR_HEIGHT}px`,
                                                        height: `${(SLOT_DURATION / 60) * HOUR_HEIGHT}px`,
                                                        left: `${(MAX_VISIBLE_EVENTS - 1) * widthPercent}%`,
                                                        width: `${widthPercent}%`,
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    +{overflowCount} more
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-2" align="start">
                                                <div className="font-semibold mb-2 text-sm">Events at {group[0].startTime}</div>
                                                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                                    {group.map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className="text-xs p-1.5 rounded text-white cursor-pointer hover:opacity-90"
                                                            style={{ backgroundColor: event.color || "blue" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEventClick?.(event);
                                                            }}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
