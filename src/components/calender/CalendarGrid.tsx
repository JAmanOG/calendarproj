import { DndContext } from '@dnd-kit/core'
import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, CollisionDetection, SensorDescriptor } from '@dnd-kit/core'

interface CalendarGridProps {
  dayNames: string[];
  sensors: SensorDescriptor<any>[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  activeTask?: { name: string } | null;  
  renderCalendarDays: () => React.ReactNode;
  closestCenter: CollisionDetection;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ dayNames, sensors, handleDragStart, handleDragEnd, activeTask, renderCalendarDays, closestCenter }) => {
  return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Day names */}
        <div className="grid select-none grid-cols-7 mb-4">
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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div
                className="bg-white border rounded-lg p-4 shadow-md"
                style={{ opacity: 0.9 }}
              >
                {activeTask.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
  )
}

export default CalendarGrid