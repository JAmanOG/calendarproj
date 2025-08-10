import { MoveLeft, MoveRight } from 'lucide-react';
import React from 'react'
import {
    format,
  } from "date-fns";
  
interface CalendarHeaderProps {
  addTaskDialog: () => React.ReactNode;
  viewTasksDialog: () => React.ReactNode;
  previousMonth: () => void;
  currentDate: Date;
  nextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ addTaskDialog, viewTasksDialog, previousMonth, currentDate, nextMonth }) => {
  return (
      <div className="bg-gray-700 text-white p-6">
        {addTaskDialog()}
        {viewTasksDialog()}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={previousMonth}
            className="p-3 hover:bg-gray-600 rounded-lg transition-colors text-2xl"
          >
            <MoveLeft />
          </button>
          <h2 className="text-3xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={nextMonth}
            className="p-3 hover:bg-gray-600 rounded-lg transition-colors text-2xl"
          >
            <MoveRight />
          </button>
        </div>
      </div>
  )
}

export default CalendarHeader