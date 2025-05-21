"use client"

import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { TaskColumn } from "./task-column"
import type { Task } from "@/lib/data"

interface TaskBoardColumnsProps {
  columns: {
    id: string
    title: string
    tasks: Task[]
  }[]
  onDragEnd: (result: any) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (columnId: string) => void
  typeColors: Record<string, string>
  getClassColor: (classId: string) => string
  classes: any[]
}

/**
 * TaskBoardColumns Component
 * Renders the draggable columns of the task board
 */
export function TaskBoardColumns({
  columns,
  onDragEnd,
  onEditTask,
  onDeleteTask,
  onAddTask,
  typeColors,
  getClassColor,
  classes
}: TaskBoardColumnsProps) {
  console.log('TaskBoardColumns received data:', {
    columnCount: columns.length,
    columns: columns.map(col => ({
      id: col.id,
      title: col.title,
      taskCount: col.tasks.length,
      tasks: col.tasks.map(t => ({
        id: t.id,
        title: t.title,
        date: t.date,
        status: t.status
      }))
    }))
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          console.log(`Rendering column ${column.id}:`, {
            title: column.title,
            taskCount: column.tasks.length
          });
          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <TaskColumn
                    columnId={column.id}
                    title={column.title}
                    tasks={column.tasks}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onAddTask={() => onAddTask(column.id)}
                    typeColors={typeColors}
                    getClassColor={getClassColor}
                    classes={classes}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  )
} 