import React from "react";
import {
    format,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from "date-fns";
import type { CalendarEvent } from "../types/calendar";

interface YearViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onMonthClick: (date: Date) => void;
}

export const YearView: React.FC<YearViewProps> = ({
    currentDate,
    events,
    onDateClick,
    onMonthClick,
}) => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-140px)]">
            {months.map((month) => (
                <MonthMiniCalendar
                    key={month.toString()}
                    month={month}
                    events={events}
                    onDateClick={onDateClick}
                    onMonthClick={onMonthClick}
                />
            ))}
        </div>
    );
};

interface MonthMiniCalendarProps {
    month: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onMonthClick: (date: Date) => void;
}

const MonthMiniCalendar: React.FC<MonthMiniCalendarProps> = ({
    month,
    events,
    onDateClick,
    onMonthClick,
}) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div className="border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div 
                className="text-center font-bold mb-2 cursor-pointer hover:text-blue-600"
                onClick={() => onMonthClick(month)}
            >
                {format(month, "MMMM")}
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                {weekdays.map((day, i) => (
                    <div key={i}>{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, month);
                    const dayEvents = events.filter((e) => isSameDay(e.date, day));
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-full cursor-pointer
                                ${!isCurrentMonth ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}
                                ${isToday(day) ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                            `}
                            onClick={() => onDateClick(day)}
                        >
                            <span>{format(day, "d")}</span>
                            {hasEvents && isCurrentMonth && (
                                <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday(day) ? "bg-white" : "bg-blue-500"}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
