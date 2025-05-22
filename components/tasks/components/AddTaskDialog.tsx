/**
 * AddTaskDialog Component
 * 
 * A modal dialog component for creating new tasks. It provides a form interface with:
 * - Task title input
 * - Task type selection with color coding
 * - Due date and time selection
 * - Optional class assignment
 * - Form validation
 * 
 * The component includes dropdown menus for task types and classes,
 * and uses a custom time picker for precise time selection.
 */

"use client"

// Import UI components and utilities
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isToday } from "date-fns"
import { capitalizeWords } from '../task-utils'
import { CustomTimePicker } from '../custom-time-picker'
import type { Task, Class } from "@/lib/data"

// Define component props interface
interface AddTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newTask: Partial<Task>
  setNewTask: (task: Partial<Task>) => void
  validation: { title: boolean, type: boolean, date: boolean }
  setValidation: (validation: { title: boolean, type: boolean, date: boolean }) => void
  handleCreateTask: () => void
  taskTypes: string[]
  typeColors: Record<string, string>
  getTaskTypeColors: (type: string) => { bg: string, text: string }
  classes: Class[]
  showTypeDropdown: boolean
  setShowTypeDropdown: (show: boolean) => void
  showClassDropdown: boolean
  setShowClassDropdown: (show: boolean) => void
  typeInputRef: React.RefObject<HTMLInputElement | null>
  classInputRef: React.RefObject<HTMLInputElement | null>
}

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  newTask,
  setNewTask,
  validation,
  setValidation,
  handleCreateTask,
  taskTypes,
  typeColors,
  getTaskTypeColors,
  classes,
  showTypeDropdown,
  setShowTypeDropdown,
  showClassDropdown,
  setShowClassDropdown,
  typeInputRef,
  classInputRef
}: AddTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Dialog header with title and description */}
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task with title, type, due date, and optional class assignment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Task title input field */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={e => {
                setNewTask({ ...newTask, title: e.target.value });
                if (validation.title && e.target.value.trim()) setValidation({...validation, title: false});
              }}
              className={validation.title ? "border-red-500 focus:ring-red-400 focus:border-red-400" : ""}
            />
          </div>

          {/* Task type selection with dropdown */}
          <div className="space-y-2">
            <Label htmlFor="type">Task Type</Label>
            <div className="relative">
              <Input
                id="type"
                ref={typeInputRef}
                placeholder="e.g., homework, quiz, lab"
                value={capitalizeWords(newTask.type || "")}
                onChange={e => {
                  setNewTask({ ...newTask, type: e.target.value.toLowerCase() });
                  setShowTypeDropdown(true);
                  if (validation.type && e.target.value.trim()) setValidation({...validation, type: false});
                }}
                onFocus={() => setShowTypeDropdown(true)}
                onBlur={() => setTimeout(() => setShowTypeDropdown(false), 150)}
                autoComplete="off"
                className={`cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm ${validation.type ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
              />
              {/* Type dropdown menu */}
              {showTypeDropdown && taskTypes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {taskTypes.filter(type => type.toLowerCase().includes((newTask.type || '').toLowerCase())).length === 0 && (
                    <div className="p-2 text-slate-400 text-sm">No matches</div>
                  )}
                  {taskTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                      style={{ backgroundColor: typeColors[type] || getTaskTypeColors(type).bg.replace('bg-', '#'), color: '#222' }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setNewTask({ ...newTask, type })
                        setShowTypeDropdown(false)
                        typeInputRef.current?.blur()
                      }}
                    >
                      {capitalizeWords(type)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and time selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Due Date (required) & Time (optional)</Label>
            <div className="flex flex-row gap-4 items-start">
              {/* Date picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="date"
                    readOnly
                    value={newTask.date ? format(parseISO(newTask.date), 'yyyy-MM-dd') : ''}
                    placeholder="Pick a date"
                    className={`w-36 cursor-pointer ${validation.date ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.date ? parseISO(newTask.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve the existing time when updating the date
                        const existingDate = newTask.date ? parseISO(newTask.date) : new Date();
                        const newDate = new Date(date);
                        newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
                        setNewTask({ 
                          ...newTask, 
                          date: newDate.toISOString()
                        });
                      }
                    }}
                    className="rounded-md border"
                    modifiers={{ today: (date) => isToday(date) }}
                    modifiersStyles={{
                      today: {
                        fontWeight: 'bold',
                        border: '2px solid #a78bfa',
                        borderRadius: '50%'
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Time picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="time"
                    readOnly
                    value={newTask.date ? format(parseISO(newTask.date), 'h:mm a') : ''}
                    placeholder="Pick time"
                    className="w-24 cursor-pointer"
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <CustomTimePicker
                    value={newTask.date ? format(parseISO(newTask.date), 'HH:mm') : ''}
                    onChange={val => {
                      if (newTask.date) {
                        let date = parseISO(newTask.date);
                        let [h, m] = val.split(":");
                        date.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
                        setNewTask({ ...newTask, date: date.toISOString() });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Class selection with dropdown */}
          <div className="space-y-2">
            <Label htmlFor="class">Class (optional)</Label>
            <div className="relative">
              <Input
                id="class"
                ref={classInputRef}
                placeholder="Select a class"
                value={classes.find(c => c.id === newTask.class_id)?.name || ""}
                onChange={e => {
                  setNewTask({ ...newTask, class_id: e.target.value })
                  setShowClassDropdown(true)
                }}
                onFocus={() => setShowClassDropdown(true)}
                onBlur={() => setTimeout(() => setShowClassDropdown(false), 150)}
                autoComplete="off"
                className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
              />
              {/* Class dropdown menu */}
              {showClassDropdown && classes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {classes.length === 0 && (
                    <div className="p-2 text-slate-400 text-sm">No classes available</div>
                  )}
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                      style={{ backgroundColor: cls.color, color: '#222' }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setNewTask({ ...newTask, class_id: cls.id })
                        setShowClassDropdown(false)
                        classInputRef.current?.blur()
                      }}
                    >
                      {capitalizeWords(cls.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <Button 
            onClick={handleCreateTask} 
            className="w-full"
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 