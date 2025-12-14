import { useState } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears, format } from "date-fns";

import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { YearView } from "./YearView";

import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { CalendarEvent, ViewType } from "../types/calendar";
import { EventModal } from "./EventModal";


export const Calendar = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [view, setView] = useState<ViewType>("month");
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

    // Local events state
    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: "1",
            title: "Morning Standup",
            date: new Date("2025-12-01"),
            startTime: "09:00",
            color: "indigo",
            description: "Daily team sync",
        },
        {
            id: "2",
            title: "Client Call",
            date: new Date("2025-12-01"),
            startTime: "11:00",
            color: "green",
            description: "Discuss project updates",
        },
        {
            id: "3",
            title: "Lunch Break",
            date: new Date("2025-12-01"),
            startTime: "12:30",
            color: "orange",
            description: "Relax and recharge",
        },
        {
            id: "4",
            title: "Design Review",
            date: new Date("2025-12-02"),
            startTime: "14:00",
            color: "purple",
            description: "UI/UX feedback",
        },
        {
            id: "5",
            title: "Quick Sync",
            date: new Date("2025-12-02"),
            startTime: "15:00", // Adjusted to 30 min slot
            color: "blue",
            description: "Short team discussion",
        },
    ]);

    // Navigation
    const goPrev = () => {
        if (view === "year") setCurrentDateTime(subYears(currentDateTime, 1));
        if (view === "month") setCurrentDateTime(subMonths(currentDateTime, 1));
        if (view === "week") setCurrentDateTime(subWeeks(currentDateTime, 1));
        if (view === "day") setCurrentDateTime(subDays(currentDateTime, 1));
    };

    const goNext = () => {
        if (view === "year") setCurrentDateTime(addYears(currentDateTime, 1));
        if (view === "month") setCurrentDateTime(addMonths(currentDateTime, 1));
        if (view === "week") setCurrentDateTime(addWeeks(currentDateTime, 1));
        if (view === "day") setCurrentDateTime(addDays(currentDateTime, 1));
    };

    const goToday = () => setCurrentDateTime(new Date());

    const handleDateClick = (date: Date) => {
        setSelectedDateForEvent(date);
        setSelectedEvent(undefined); // Clear selected event for new creation
        setIsEventModalOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedDateForEvent(event.date);
        setIsEventModalOpen(true);
    };

    const handleLeftCalendarSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDateTime(date);
            setView("month");
        }
    };

    const handleLeftCalendarDoubleClick = (date: Date) => {
        setCurrentDateTime(date);
        setView("day");
    };

    const getHeaderText = () => {
        if (view === "year") return format(currentDateTime, "yyyy");
        if (view === "month") return format(currentDateTime, "MMMM yyyy");
        if (view === "week") return `Week of ${format(currentDateTime, "MMM d, yyyy")}`;
        if (view === "day") return format(currentDateTime, "MMMM d, yyyy");
        return "";
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold mr-4 min-w-[200px]">{getHeaderText()}</h2>
                    <Button onClick={goPrev} variant="outline" size="icon">
                        <span className="sr-only">Previous</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                    </Button>
                    <Button onClick={goToday} variant="outline">Today</Button>
                    <Button onClick={goNext} variant="outline" size="icon">
                        <span className="sr-only">Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                    </Button>

                    <EventModal
                        isOpen={isEventModalOpen}
                        onOpenChange={setIsEventModalOpen}
                        defaultDate={selectedDateForEvent}
                        eventToEdit={selectedEvent}
                        onCreate={(newEvent) => {
                            setEvents((prev) => [...prev, newEvent]);
                        }}
                        onUpdate={(updatedEvent) => {
                             setEvents((prev) => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
                        }}
                        onDelete={(eventId) => {
                            setEvents((prev) => prev.filter(e => e.id !== eventId));
                        }}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {(["year", "month", "week", "day"] as const).map((v) => (
                        <Button
                            key={v}
                            variant={view === v ? "default" : "outline"}
                            onClick={() => setView(v)}
                        >
                            {v.toUpperCase()}
                        </Button>

                    ))}
                </div>
            </div>

            {/* Layout: Left mini calendar + Main calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-100px)]">
                {/* Left sidebar */}
                <aside className="hidden lg:block h-full overflow-y-auto overflow-x-hidden">
                    <div className="p-3 flex justify-center">
                        <div className="border rounded-md shadow-sm bg-white inline-block">
                            <ShadCalendar
                                mode="single"
                                selected={currentDateTime}
                                onSelect={handleLeftCalendarSelect}
                                events={events}
                                onDayDoubleClick={handleLeftCalendarDoubleClick}
                                className="rounded-md"
                            />
                        </div>
                    </div>
                </aside>

                {/* Main calendar */}
                <main className="bg-white rounded-lg shadow-sm border flex flex-col h-full overflow-hidden">
                    <div className="flex-1 h-full overflow-hidden">
                        {view === "year" && (
                            <div className="p-4">
                                <YearView
                                    currentDate={currentDateTime}
                                    events={events}
                                    onDateClick={(date) => {
                                        setCurrentDateTime(date);
                                        setView("day");
                                    }}
                                    onMonthClick={(date) => {
                                        setCurrentDateTime(date);
                                        setView("month");
                                    }}
                                />
                            </div>
                        )}
                        {view === "month" && (
                            <MonthView
                                currentDate={currentDateTime}
                                events={events}
                                setEvents={setEvents}
                                onDateClick={handleDateClick}
                                onEventClick={handleEventClick}
                            />
                        )}
                        {view === "week" && (
                            <WeekView
                                currentDate={currentDateTime}
                                events={events}
                                setEvents={setEvents}
                                onDateClick={handleDateClick}
                                onEventClick={handleEventClick}
                            />
                        )}
                        {view === "day" && (
                            <DayView
                                currentDate={currentDateTime}
                                events={events}
                                setEvents={setEvents}
                                onDateClick={handleDateClick}
                                onEventClick={handleEventClick}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
