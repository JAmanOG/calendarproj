import React, { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { MoveLeft } from "lucide-react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const renderCalendarDays = () => {
    return dateRange.map((date) => {
      const isCurrentMonth = format(date, "M") === format(currentDate, "M");
      const isTodayDate = isToday(date);

      return (
        <div
          key={date.toISOString()}
          className={`
                        p-4 h-20 flex items-center justify-center cursor-pointer
                        transition-colors duration-200 rounded-lg
                        ${
                          isTodayDate
                            ? "bg-gray-500 text-white font-bold shadow-lg"
                            : isCurrentMonth
                            ? "hover:bg-gray-100 text-gray-700"
                            : "text-gray-300 hover:bg-gray-50"
                        }
                    `}
        >
          {format(date, "d")}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-700 text-white p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={previousMonth}
            className="p-3 hover:bg-gray-600 rounded-lg transition-colors text-2xl"
          >
            ←
          </button>
          <h2 className="text-3xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={nextMonth}
            className="p-3 hover:bg-gray-600 rounded-lg transition-colors text-2xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Day names */}
        <div className="grid grid-cols-7 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-lg font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      </div>
    </div>
  );
};

export default Calendar;
