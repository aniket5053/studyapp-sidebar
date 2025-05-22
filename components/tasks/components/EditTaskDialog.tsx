/**
 * EditTaskDialog Component
 * 
 * A modal dialog component for editing existing tasks. It provides a form interface with:
 * - Task title editing
 * - Task type modification with color coding
 * - Due date and time adjustment
 * - Class reassignment
 * - Status modification
 * - Form validation
 * 
 * The component reuses much of the same structure as AddTaskDialog
 * but includes additional functionality for status management.
 */

"use client"

import React from "react"
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

interface EditTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editTask: Partial<Task> | null
  setEditTask: (task: Partial<Task> | null) => void
  editValidation: { title: boolean, type: boolean, date: boolean }
  setEditValidation: (validation: { title: boolean, type: boolean, date: boolean }) => void
  handleEditTask: () => void
  taskTypes: string[]
  typeColors: Record<string, string>
  getTaskTypeColors: (type: string) => { bg: string, text: string }
  classes: Class[]
  showTypeDropdown: boolean
  setShowTypeDropdown: (show: boolean) => void
  showClassDropdown: boolean
  setShowClassDropdown: (show: boolean) => void
  showStatusDropdown: boolean
  setShowStatusDropdown: (show: boolean) => void
  typeInputRef: React.RefObject<HTMLInputElement | null>
  classInputRef: React.RefObject<HTMLInputElement | null>
  statusInputRef: React.RefObject<HTMLInputElement | null>
}

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  editTask,
  setEditTask,
  editValidation,
  setEditValidation,
  handleEditTask,
  taskTypes,
  typeColors,
  getTaskTypeColors,
  classes,
  showTypeDropdown,
  setShowTypeDropdown,
  showClassDropdown,
  setShowClassDropdown,
  showStatusDropdown,
  setShowStatusDropdown,
  typeInputRef,
  classInputRef,
  statusInputRef
}: EditTaskDialogProps) {
  if (!editTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Make changes to your task here.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Task Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter task title"
              value={editTask.title}
              onChange={e => {
                setEditTask({ ...editTask, title: e.target.value });
                if (editValidation.title && e.target.value.trim()) setEditValidation({...editValidation, title: false});
              }}
              className={editValidation.title ? "border-red-500 focus:ring-red-400 focus:border-red-400" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">Task Type</Label>
            <div className="relative">
              <Input
                id="edit-type"
                ref={typeInputRef}
                placeholder="e.g., homework, quiz, lab"
                value={capitalizeWords(editTask.type || "")}
                onChange={e => {
                  setEditTask({ ...editTask, type: e.target.value.toLowerCase() });
                  setShowTypeDropdown(true);
                  if (editValidation.type && e.target.value.trim()) setEditValidation({...editValidation, type: false});
                }}
                onFocus={() => setShowTypeDropdown(true)}
                onBlur={() => setTimeout(() => setShowTypeDropdown(false), 150)}
                autoComplete="off"
                className={`cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm ${editValidation.type ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
              />
              {showTypeDropdown && taskTypes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {taskTypes.filter(type => type.toLowerCase().includes((editTask.type || '').toLowerCase())).length === 0 && (
                    <div className="p-2 text-slate-400 text-sm">No matches</div>
                  )}
                  {taskTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                      style={{ backgroundColor: typeColors[type] || getTaskTypeColors(type).bg, color: '#222' }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setEditTask({ ...editTask, type })
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
          <div className="space-y-2">
            <Label htmlFor="edit-date">Due Date (required) & Time (optional)</Label>
            <div className="flex flex-row gap-4 items-start">
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="edit-date"
                    readOnly
                    value={editTask.date ? format(parseISO(editTask.date), 'yyyy-MM-dd') : ''}
                    placeholder="Pick a date"
                    className={`w-36 cursor-pointer ${editValidation.date ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={editTask.date ? parseISO(editTask.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve the existing time when updating the date
                        const existingDate = editTask.date ? parseISO(editTask.date) : new Date();
                        const newDate = new Date(date);
                        newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
                        setEditTask({ 
                          ...editTask, 
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
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="edit-time"
                    readOnly
                    value={editTask.date ? format(parseISO(editTask.date), 'h:mm a') : ''}
                    placeholder="Pick time"
                    className="w-24 cursor-pointer"
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <CustomTimePicker
                    value={editTask.date ? format(parseISO(editTask.date), 'HH:mm') : ''}
                    onChange={val => {
                      if (editTask.date) {
                        let date = parseISO(editTask.date);
                        let [h, m] = val.split(":");
                        date.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
                        setEditTask({ ...editTask, date: date.toISOString() });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-class">Class (optional)</Label>
            <div className="relative">
              <Input
                id="edit-class"
                ref={classInputRef}
                placeholder="Select a class"
                value={classes.find(c => c.id === editTask.class_id)?.name || ""}
                onChange={e => {
                  setEditTask({ ...editTask, class_id: e.target.value })
                  setShowClassDropdown(true)
                }}
                onFocus={() => setShowClassDropdown(true)}
                onBlur={() => setTimeout(() => setShowClassDropdown(false), 150)}
                autoComplete="off"
                className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
              />
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
                        setEditTask({ ...editTask, class_id: cls.id })
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
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <div className="relative">
              <Input
                id="edit-status"
                ref={statusInputRef}
                placeholder="Select status"
                value={editTask.status === 'not-started' ? 'Not started' : editTask.status === 'in-progress' ? 'In Progress' : editTask.status === 'to-submit' ? 'Yet to submit' : 'Done'}
                onChange={e => {
                  setEditTask({ ...editTask, status: e.target.value as Task['status'] })
                  setShowStatusDropdown(true)
                }}
                onFocus={() => setShowStatusDropdown(true)}
                onBlur={() => setTimeout(() => setShowStatusDropdown(false), 150)}
                autoComplete="off"
                className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
              />
              {showStatusDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {[
                    { value: 'not-started', label: 'Not started', color: '#fee2e2' }, // red-100
                    { value: 'in-progress', label: 'In Progress', color: '#fef9c3' }, // yellow-100
                    { value: 'to-submit', label: 'Yet to submit', color: '#f3e8ff' }, // purple-100
                    { value: 'done', label: 'Done', color: '#dcfce7' } // green-100
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-opacity-80 focus:bg-opacity-90 text-sm"
                      style={{ backgroundColor: status.color }}
                      onMouseDown={e => {
                        e.preventDefault();
                        setEditTask({ ...editTask, status: status.value as Task['status'] })
                        setShowStatusDropdown(false)
                        statusInputRef.current?.blur()
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={handleEditTask} 
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 