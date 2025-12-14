import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";

export function getMonthMatrix(currentDate: Date): Date[][] {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  const matrix: Date[][] = [];
  let day = start;

  while (day <= end) {
    const weekRow: Date[] = [];

    for (let i = 0; i < 7; i++) {
      weekRow.push(day);
      day = addDays(day, 1);
    }

    matrix.push(weekRow);
  }

  return matrix;
}
