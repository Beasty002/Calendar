import React, { Fragment } from "react";
import {
    startOfWeek,
    addDays,
    format,
    isSameDay,
    isToday,
} from "date-fns";
import type { CalendarEvent } from "../types/calendar";
import { SLOT_DURATION } from "@/lib/constants";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    onDateClick: (date: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 60; // px per hour

export const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    events,
    setEvents,
    onDateClick,
    onEventClick,
}) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const hours = Array.from({ length: 24 }).map((_, i) => i);



    return (
        <div className="h-full overflow-auto bg-white">
            <div className="min-w-[800px] flex flex-col">
                {/* Weekday header */}
                <div className="flex border-b border-gray-300 bg-white sticky top-0 z-30 px-4 pt-4 pb-2">
                    <div className="w-12 flex-none border-r border-gray-200"></div> {/* Time column header spacer */}
                    <div className="flex-1 grid grid-cols-7">
                        {days.map((day) => (
                            <div
                                key={day.toString()}
                                className={`text-center font-semibold border-r border-gray-200 last:border-r-0 ${isToday(day) ? "text-blue-500" : ""
                                    }`}
                            >
                                <div>{format(day, "EEE")}</div>
                                <div>{format(day, "d MMM")}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline grid */}
                <div className="flex flex-1 relative px-4 pt-6">
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

                    {/* Days Grid */}
                    <div className="flex-1 relative">
                        {/* Horizontal Grid Lines */}
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] border-b border-gray-100 w-full absolute"
                                style={{ top: `${hour * 60}px` }}
                            />
                        ))}

                        {/* Vertical Day Columns & Events */}
                        <div className="absolute inset-0 grid grid-cols-7 h-[1440px]">
                            {days.map((day, dayIndex) => {
                                const dayEvents = events.filter((event) => isSameDay(event.date, day));
                                
                                // Sort and position events for this day
                                const sortedEvents = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
                                
                                // Group overlapping events
                                const eventsByTime: Record<string, typeof sortedEvents> = {};
                                sortedEvents.forEach(event => {
                                    if (!eventsByTime[event.startTime]) eventsByTime[event.startTime] = [];
                                    eventsByTime[event.startTime].push(event);
                                });

                                return (
                                    <div key={day.toString()} className="relative border-r border-gray-200 last:border-r-0 h-full"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const y = e.clientY - rect.top;
                                            const hour = Math.floor(y / 60);
                                            const dateWithTime = new Date(day);
                                            dateWithTime.setHours(hour, 0, 0, 0);
                                            onDateClick(dateWithTime);
                                        }}
                                    >
                                        {/* Render Events for this Day */}
                                        {Object.values(eventsByTime).map((group) => {
                                            const MAX_VISIBLE_EVENTS = 3;
                                            const hasOverflow = group.length > MAX_VISIBLE_EVENTS;
                                            const visibleEvents = hasOverflow ? group.slice(0, MAX_VISIBLE_EVENTS - 1) : group;
                                            const overflowCount = group.length - (MAX_VISIBLE_EVENTS - 1);
                                            
                                            // Calculate width based on the visual slots (either all events or visible + 1 for overflow)
                                            const slotCount = hasOverflow ? MAX_VISIBLE_EVENTS : group.length;
                                            const widthPercent = 100 / slotCount;

                                            return (
                                                <Fragment key={group[0].startTime}>
                                                    {visibleEvents.map((event, index) => {
                                                        const [h, m] = event.startTime.split(":").map(Number);
                                                        const startMin = h * 60 + m;
                                                        const top = (startMin / 60) * 60; // 60px per hour
                                                        const height = (SLOT_DURATION / 60) * 60;
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
                                                                        top: `${(group[0].startTime.split(":").map(Number)[0] * 60 + group[0].startTime.split(":").map(Number)[1]) / 60 * 60}px`,
                                                                        height: `${(SLOT_DURATION / 60) * 60}px`,
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
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
