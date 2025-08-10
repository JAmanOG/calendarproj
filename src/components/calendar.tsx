import { useState, useEffect } from "react"; // replaced previous react import to include useEffect
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
import { MoveLeft, MoveRight } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/useTasks";
import type { Task } from "@/lib/useTasks";
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Helper utilities for date-only comparison and math
const toDateOnly = (d: Date | string) => new Date((typeof d === 'string' ? d : d.toISOString()).split('T')[0]);
const isoDateOnly = (d: Date) => toDateOnly(d).toISOString();
const getTaskStart = (t: Task) => toDateOnly(t.startDate ?? t.date);
const getTaskEnd = (t: Task) => toDateOnly(t.endDate ?? t.startDate ?? t.date);

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isViewTasksDialogOpen, setIsViewTasksDialogOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null); // new
  const [isDraggingToSelect, setIsDraggingToSelect] = useState(false); // new
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null); // new
  const { addTask: saveTask, getTasksByDate, updateTask, deleteTask } = useTasks();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateTasks = getTasksByDate(date);
    
    if (dateTasks.length === 0) {
      setIsAddTaskDialogOpen(true);
    } else {
      setIsViewTasksDialogOpen(true);
    }
  };

  const handleAddTaskFromView = () => {
    setIsViewTasksDialogOpen(false);
    setIsAddTaskDialogOpen(true);
  };

  const handleTaskStatusUpdate = (taskId: string, newCategory: Task['category']) => {
    updateTask(taskId, { category: newCategory });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    // Find the task being interacted with (strip any prefix)
    const taskId = activeId.includes(':') ? activeId.split(':')[1] : activeId;

    const allTasks = dateRange.flatMap(date => getTasksByDate(date));
    const task = allTasks.find(t => t.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeTask) {
      setActiveTask(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Droppable day id is an ISO date string
    const dropDate = toDateOnly(new Date(overId));

    // Determine drag type
    if (activeId.startsWith('task:')) {
      // Move entire task (preserve duration if multi-day)
      const start = getTaskStart(activeTask);
      const durationDays = Math.round((getTaskEnd(activeTask).getTime() - getTaskStart(activeTask).getTime()) / (1000 * 60 * 60 * 24));

      // If same start date, no change
      if (isoDateOnly(start) === isoDateOnly(dropDate)) {
        setActiveTask(null);
        return;
      }

      if (durationDays > 0) {
        const newStart = dropDate;
        const newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + durationDays);
        updateTask(activeTask.id, {
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
          date: newStart.toISOString(),
        });
      } else {
        // Single-day
        updateTask(activeTask.id, { date: dropDate.toISOString(), startDate: undefined, endDate: undefined });
      }
    } else if (activeId.startsWith('resize-start:')) {
      // Resize start to drop date, clamp to <= end
      const end = getTaskEnd(activeTask);
      let newStart = dropDate;
      if (newStart > end) {
        // Collapse to single day at drop date
        updateTask(activeTask.id, {
          startDate: newStart.toISOString(),
          endDate: newStart.toISOString(),
          date: newStart.toISOString(),
        });
      } else {
        updateTask(activeTask.id, {
          startDate: newStart.toISOString(),
          date: newStart.toISOString(),
        });
      }
    } else if (activeId.startsWith('resize-end:')) {
      // Resize end to drop date, clamp to >= start
      const start = getTaskStart(activeTask);
      let newEnd = dropDate;
      if (newEnd < start) {
        // Collapse to single day at drop date
        updateTask(activeTask.id, {
          startDate: newEnd.toISOString(),
          endDate: newEnd.toISOString(),
          date: newEnd.toISOString(),
        });
      } else {
        updateTask(activeTask.id, {
          endDate: newEnd.toISOString(),
        });
      }
    } else {
      // Backward compatibility: previous behavior using bare id
      const taskId = activeId;
      const newDate = dropDate.toISOString();
      if (activeTask.date !== newDate) {
        updateTask(taskId, { date: newDate });
      }
    }

    setActiveTask(null);
  };

  // --- Drag-to-select handlers ---
  const handleDateMouseDown = (date: Date, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-task-element]')) return; // ignore when clicking a task
    e.preventDefault();
    setIsDraggingToSelect(true);
    setDragStartDate(date);
    setSelectedRange({ start: date, end: date });
  };
  const handleDateMouseEnter = (date: Date) => {
    if (!isDraggingToSelect || !dragStartDate) return;
    const start = dragStartDate < date ? dragStartDate : date;
    const end = dragStartDate < date ? date : dragStartDate;
    setSelectedRange({ start, end });
  };
  const finishRangeSelection = () => {
    if (!isDraggingToSelect) return;
    setIsDraggingToSelect(false);
    setDragStartDate(null);
    if (selectedRange) {
      setSelectedDate(selectedRange.start); // anchor for form
      setIsAddTaskDialogOpen(true);
    }
  };

  useEffect(() => {
    const up = () => finishRangeSelection();
    document.addEventListener('mouseup', up);
    return () => document.removeEventListener('mouseup', up);
  }, [isDraggingToSelect, selectedRange]);
  // --- end drag-to-select ---

  // Helper to test date in range
  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const renderCalendarDays = () => {
    return dateRange.map((date) => {
      const isCurrentMonth = format(date, "M") === format(currentDate, "M");
      const isTodayDate = isToday(date);
      const dateTasks = getTasksByDate(date);
      const inRange = isDateInSelectedRange(date); // new

      return (
        <DroppableCalendarDay
          key={date.toISOString()}
          date={date}
          isCurrentMonth={isCurrentMonth}
          isTodayDate={isTodayDate}
          tasks={dateTasks}
          onClick={() => handleDateClick(date)}
          onMouseDown={(e)=>handleDateMouseDown(date,e)}
          onMouseEnter={()=>handleDateMouseEnter(date)}
          inSelectedRange={inRange}
        />
      );
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedDate) return;

    const name = formData.get('name') as string;
    const category = formData.get('category') as Task['category'];
    const description = (formData.get('description') as string) || undefined;

    if (!name || !category) return;

    if (selectedRange && (selectedRange.start.getTime() !== selectedRange.end.getTime())) {
      saveTask({
        name,
        category,
        description,
        date: selectedRange.start.toISOString(),
        startDate: selectedRange.start.toISOString(),
        endDate: selectedRange.end.toISOString(),
      });
    } else {
      saveTask({ name, category, description, date: selectedDate.toISOString() });
    }
    setIsAddTaskDialogOpen(false);
    setSelectedRange(null);
    e.currentTarget.reset();
  };

  const viewTasksDialog = () => {
    if (!selectedDate) return null;
    const dateTasks = getTasksByDate(selectedDate);

    return (
      <Dialog open={isViewTasksDialogOpen} onOpenChange={setIsViewTasksDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''} scheduled for this day
            </DialogDescription>
          </DialogHeader>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {dateTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Status:</Label>
                  <Select 
                    value={task.category} 
                    onValueChange={(value) => handleTaskStatusUpdate(task.id, value as Task['category'])}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          To Do
                        </div>
                      </SelectItem>
                      <SelectItem value="progress">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="review">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          Review
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          Completed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Close
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddTaskFromView}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add New Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const addTaskDialog = () => {
    return (
      <Dialog open={isAddTaskDialogOpen} onOpenChange={(open)=>{setIsAddTaskDialogOpen(open); if(!open) setSelectedRange(null);}}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-gray-900">Create New Task</DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedRange ? (
                  selectedRange.start.getTime() === selectedRange.end.getTime() ?
                  `Add a task for ${format(selectedRange.start,'MMMM d, yyyy')}` :
                  `Add a task spanning ${format(selectedRange.start,'MMM d')} – ${format(selectedRange.end,'MMM d, yyyy')}`
                ) : selectedDate ? `Add a task for ${format(selectedDate,'MMMM d, yyyy')}` : 'Add a new task'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="task-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Task Name
                </Label>
                <Input
                  id="task-name"
                  name="name"
                  placeholder="Enter task name..."
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="task-category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category
                </Label>
                <Select name="category" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs text-gray-500 uppercase tracking-wide">
                        Status
                      </SelectLabel>
                      <SelectItem value="todo" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          To Do
                        </div>
                      </SelectItem>
                      <SelectItem value="progress" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="review" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          Review
                        </div>
                      </SelectItem>
                      <SelectItem value="completed" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          Completed
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="task-description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description (Optional)
                </Label>
                <Input
                  id="task-description"
                  name="description"
                  placeholder="Brief description of the task..."
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Calendar Grid */}
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
    </div>
  );
};

interface DraggableTaskProps {
  task: Task;
  cellDate: Date;
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
}

const DraggableTask = ({ task, cellDate, onClick, draggable = true }: DraggableTaskProps) => {
  const start = getTaskStart(task);
  const end = getTaskEnd(task);
  const cell = toDateOnly(cellDate);
  const isStart = isoDateOnly(start) === isoDateOnly(cell);
  const isEnd = isoDateOnly(end) === isoDateOnly(cell);

  const {
    attributes: bodyAttrs,
    listeners: bodyListeners,
    setNodeRef: setBodyRef,
    transform: bodyTransform,
    isDragging: internalIsDragging,
  } = useDraggable({ id: `task:${task.id}`, disabled: !draggable });
  // Added missing draggable hooks for resize handles
  const { attributes: lsAttrs, listeners: lsListeners, setNodeRef: setLsRef } = useDraggable({ id: `resize-start:${task.id}` , disabled: !draggable});
  const { attributes: rsAttrs, listeners: rsListeners, setNodeRef: setRsRef } = useDraggable({ id: `resize-end:${task.id}` , disabled: !draggable});
  const isDraggable = draggable;
  const isDragging = internalIsDragging && draggable;

  const style = bodyTransform ? { transform: `translate3d(${bodyTransform.x}px, ${bodyTransform.y}px, 0)` } : undefined;

  const color =
    task.category === 'todo' ? 'bg-red-500' :
    task.category === 'progress' ? 'bg-yellow-500' :
    task.category === 'review' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="relative" data-task-element>
      {/* Segment body */}
      <div
        ref={setBodyRef}
        style={style}
        {...(isDraggable ? bodyListeners : {})}
        {...(isDraggable ? bodyAttrs : {})}
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`
          px-2 py-1 text-xs font-medium truncate text-white transition-opacity duration-200 hover:shadow-sm select-none
          ${isDraggable ? 'cursor-grab' : 'cursor-default opacity-80'}
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${color}
          ${isStart ? 'rounded-l-md' : 'rounded-l-none'}
          ${isEnd ? 'rounded-r-md' : 'rounded-r-none'}
        `}
        title={`${task.name}${task.description ? ': ' + task.description : ''}`}
      >
        {task.name}
      </div>

      {/* Left resize handle (only on start or single-day) */}
      {(isStart || isoDateOnly(start) === isoDateOnly(end)) && isDraggable && (
        <div
          ref={setLsRef}
          {...(isDraggable ? lsListeners : {})}
          {...(isDraggable ? lsAttrs : {})}
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 h-full w-2 cursor-col-resize select-none ${color}`}
          style={{ borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem', opacity: 0.9 }}
        />
      )}

      {/* Right resize handle (only on end or single-day) */}
      {(isEnd || isoDateOnly(start) === isoDateOnly(end)) && isDraggable && (
        <div
          ref={setRsRef}
          {...(isDraggable ? rsListeners : {})}
          {...(isDraggable ? rsAttrs : {})}
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none ${color}`}
          style={{ borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem', opacity: 0.9 }}
        />
      )}
    </div>
  );
};

interface DroppableCalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  tasks: Task[];
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent)=>void; // new
  onMouseEnter?: ()=>void; // new
  inSelectedRange?: boolean; // new
}

const DroppableCalendarDay = ({ 
  date, 
  isCurrentMonth, 
  isTodayDate, 
  tasks, 
  onClick,
  onMouseDown,
  onMouseEnter,
  inSelectedRange
}: DroppableCalendarDayProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: date.toISOString(), });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={`
        p-2 h-32 flex select-none flex-col cursor-pointer
        transition-all duration-200 rounded-lg relative
        border-2 ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
        ${isOver ? 'shadow-lg' : 'hover:bg-gray-50'}
        ${inSelectedRange ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${
          isTodayDate
            ? 'bg-blue-50 border-blue-300 shadow-sm'
            : isCurrentMonth
            ? 'bg-white hover:bg-gray-50'
            : 'bg-gray-50 text-gray-400'
        }
      `}
    >
      {/* Date number */}
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-sm font-medium ${
            isTodayDate
              ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
              : isCurrentMonth
              ? "text-gray-900"
              : "text-gray-400"
          }`}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Task strips */}
      <div className="flex-1 space-y-1 overflow-hidden group">
        {tasks.slice(0, 4).map((task) => (
          <DraggableTask key={`${task.id}-${date.toISOString()}`} task={task} cellDate={date} />
        ))}
        {tasks.length > 4 && (
          <div className="px-2 py-1 bg-gray-400 text-white rounded text-xs font-medium">
            +{tasks.length - 4} more
          </div>
        )}
        {isOver && (
          <div className="px-2 py-1 border-2 border-dashed border-blue-400 rounded text-xs text-blue-600 text-center">
            Drop here
          </div>
        )}
        {tasks.length === 0 && !isOver && (
          <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to add task
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;

