export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: string; // "HH:mm"
  color?: string;
  description?: string;
};

export type ViewType = "year" | "month" | "week" | "day";
