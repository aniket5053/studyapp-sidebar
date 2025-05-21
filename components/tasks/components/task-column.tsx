"use client"

import { Button } from "@/components/ui/button"
import { Droppable, Draggable } from '@hello-pangea/dnd'
import type { Task } from "@/lib/data"
import { TaskCard } from "./task-card"

interface TaskColumnProps {
  columnId: string
  title: string
  tasks: Task[]
  typeColors: Record<string, string>
  getClassColor: (classId: string) => string
  classes: any[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (status: string) => void
}

/**
 * TaskColumn Component
 * Renders a column of tasks with drag and drop functionality
 */
export function TaskColumn({ 
  columnId, 
  title, 
  tasks, 
  typeColors, 
  getClassColor, 
  classes,
  onEditTask,
  onDeleteTask,
  onAddTask 
}: TaskColumnProps) {
  console.log(`Rendering TaskColumn ${columnId}:`, {
    title,
    taskCount: tasks.length,
    tasks: tasks.map(t => ({
      id: t.id,
      title: t.title,
      date: t.date,
      status: t.status
    }))
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-lg">
      <div className={
        columnId === 'not-started'
          ? "bg-rose-100 p-3 font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
          : columnId === 'in-progress'
            ? "bg-yellow-100 p-3 font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100"
            : columnId === 'to-submit'
                ? "bg-purple-100 p-3 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-100"
                : "bg-green-100 p-3 font-medium text-green-800 dark:bg-green-900/40 dark:text-green-100"
      }>
        {title}
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 space-y-3 min-h-[100px] flex flex-col ${snapshot.isDraggingOver ? 'bg-slate-50' : ''}`}
          >
            <div className="flex-1">
              {tasks.map((task, idx) => {
                console.log(`Rendering task in ${columnId}:`, {
                  id: task.id,
                  title: task.title,
                  date: task.date,
                  status: task.status
                });
                return (
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
                          getClassColor={getClassColor}
                          classes={classes}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 border-dashed border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
              onClick={() => onAddTask(columnId)}
            >
              + New Task
            </Button>
          </div>
        )}
      </Droppable>
    </div>
  )
} 