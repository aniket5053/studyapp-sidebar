/**
 * TaskColumn Component
 * 
 * A column component that represents a task status category in the Kanban board:
 * - Not Started
 * - In Progress
 * - Yet to Submit
 * - Done
 * 
 * Each column:
 * - Displays a list of tasks in that status
 * - Supports drag and drop functionality
 * - Shows a "New Task" button
 * - Has a distinct color scheme
 * - Maintains its own task list
 */

"use client"

import { Button } from "@/components/ui/button"
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { TaskCard } from './TaskCard'
import type { Task } from "@/lib/data"
import { parseISO, isBefore, addHours } from "date-fns"
import { updateTask } from '@/lib/task-operations'

interface TaskColumnProps {
  id: string
  title: string
  tasks: Task[]
  onNewTaskClick: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  typeColors: Record<string, string>
  getTaskTypeColors: (type: string) => { bg: string, text: string }
  classes: Array<{ id: string, name: string, code: string, color: string }>
}

export function TaskColumn({
  id,
  title,
  tasks,
  onNewTaskClick,
  onEditTask,
  onDeleteTask,
  typeColors,
  getTaskTypeColors,
  classes,
}: TaskColumnProps) {
  // Group tasks
  const now = new Date()

  // Filter out archived tasks
  const filteredTasks = tasks.filter(task => !task.archived)

  const overdue = filteredTasks.filter(task => task.date && isBefore(parseISO(task.date), now) && task.status !== 'done')
  const dueSoon = filteredTasks.filter(task => task.date && !isBefore(parseISO(task.date), now) && isBefore(parseISO(task.date), addHours(now, 24)) && task.status !== 'done')
  const normal = filteredTasks.filter(task => !overdue.includes(task) && !dueSoon.includes(task))

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-lg">
      <div className={
        id === 'not-started'
          ? "bg-rose-100 p-3 font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
          : id === 'in-progress'
            ? "bg-yellow-100 p-3 font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100"
            : id === 'to-submit'
                ? "bg-purple-100 p-3 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-100"
                : "bg-green-100 p-3 font-medium text-green-800 dark:bg-green-900/40 dark:text-green-100"
      }>
        {title}
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 space-y-3 min-h-[100px] flex flex-col ${snapshot.isDraggingOver ? 'bg-slate-50' : ''}`}
          >
            <div className="flex-1">
              {overdue.length > 0 && (
                <div className="mb-2 space-y-3">
                  <div className="text-xs font-bold text-red-600 mb-1">Overdue</div>
                  {overdue.map((task, idx) => (
                    <Draggable draggableId={task.id} index={idx} key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                            zIndex: snapshot.isDragging ? 9999 : 'auto',
                            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                          }}
                          className={`${snapshot.isDragging ? 'shadow-xl' : ''}`}
                        >
                          <TaskCard
                            task={task}
                            typeColors={typeColors}
                            classes={classes}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            highlight="overdue"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
              {dueSoon.length > 0 && (
                <div className="mb-2 space-y-3">
                  <div className="text-xs font-bold text-yellow-600 mb-1">Due Soon</div>
                  {dueSoon.map((task, idx) => (
                    <Draggable draggableId={task.id} index={overdue.length + idx} key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                            zIndex: snapshot.isDragging ? 9999 : 'auto',
                            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                          }}
                          className={`${snapshot.isDragging ? 'shadow-xl' : ''}`}
                        >
                          <TaskCard
                            task={task}
                            typeColors={typeColors}
                            classes={classes}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            highlight="due-soon"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
              {normal.map((task, idx) => (
                <Draggable draggableId={task.id} index={overdue.length + dueSoon.length + idx} key={task.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                      }}
                      className={`${snapshot.isDragging ? 'shadow-xl' : ''}`}
                    >
                      <TaskCard
                        task={task}
                        typeColors={typeColors}
                        classes={classes}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        highlight={null}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 border-dashed border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
              onClick={onNewTaskClick}
            >
              + New Task
            </Button>
          </div>
        )}
      </Droppable>
    </div>
  )
} 