"use client"

import { ChevronDown, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay } from "date-fns"
import { capitalizeWords } from "../task-utils"

interface TaskFiltersProps {
  filterDateRange: { start: Date, end: Date } | null
  setFilterDateRange: (range: { start: Date, end: Date } | null) => void
  filterClass: string | null
  setFilterClass: (classId: string | null) => void
  filterType: string | null
  setFilterType: (type: string | null) => void
  classes: any[]
  taskTypes: string[]
  typeColors: Record<string, string>
  sortBy: 'date' | 'title' | 'type'
  setSortBy: (sort: 'date' | 'title' | 'type') => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void
}

/**
 * TaskFilters Component
 * Renders the filter controls for the task board
 */
export function TaskFilters({
  filterDateRange,
  setFilterDateRange,
  filterClass,
  setFilterClass,
  filterType,
  setFilterType,
  classes,
  taskTypes,
  typeColors,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection
}: TaskFiltersProps) {
  const getDateRangeText = () => {
    if (!filterDateRange) return 'Due date'
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const nextWeek = addWeeks(today, 1)
    const nextMonth = addMonths(today, 1)
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === today.getTime()) {
      return 'Today'
    }
    if (filterDateRange.start.getTime() === tomorrow.getTime() && filterDateRange.end.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    }
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === nextWeek.getTime()) {
      return 'Next week'
    }
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === nextMonth.getTime()) {
      return 'Next month'
    }
    return `${format(filterDateRange.start, 'MMM d')} - ${format(filterDateRange.end, 'MMM d')}`
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-full text-xs ${filterDateRange ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
          >
            <CalendarIcon className="h-3 w-3 mr-1" />
            {getDateRangeText()}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const today = startOfDay(new Date())
                  setFilterDateRange({ start: today, end: today })
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const tomorrow = addDays(startOfDay(new Date()), 1)
                  setFilterDateRange({ start: tomorrow, end: tomorrow })
                }}
              >
                Tomorrow
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const today = startOfDay(new Date())
                  const nextWeek = addWeeks(today, 1)
                  setFilterDateRange({ start: today, end: nextWeek })
                }}
              >
                Next week
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const today = startOfDay(new Date())
                  const nextMonth = addMonths(today, 1)
                  setFilterDateRange({ start: today, end: nextMonth })
                }}
              >
                Next month
              </Button>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-slate-500 mb-2 px-1">Custom range</div>
              <Calendar
                mode="range"
                selected={{
                  from: filterDateRange?.start,
                  to: filterDateRange?.end
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setFilterDateRange({
                      start: startOfDay(range.from),
                      end: endOfDay(range.to)
                    })
                  }
                }}
                initialFocus
                className="rounded-md border"
              />
            </div>
            {filterDateRange && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => setFilterDateRange(null)}
              >
                Clear date filter
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-full text-xs ${filterClass ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
          >
            {filterClass ? classes.find(c => c.id === filterClass)?.name : 'All Classes'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto px-4 py-2" align="start">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${!filterClass ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => setFilterClass(null)}
            >
              All Classes
            </Button>
            {classes.map((cls) => (
              <Button
                key={cls.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${filterClass === cls.id ? 'bg-blue-50 text-blue-700' : ''}`}
                style={{
                  backgroundColor: cls.color,
                  color: '#222',
                  fontWeight: filterClass === cls.id ? 'bold' : 'normal',
                }}
                onClick={() => setFilterClass(cls.id)}
              >
                <span className="truncate">{capitalizeWords(cls.name)}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-full text-xs ${filterType ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
          >
            {filterType ? filterType : 'All Types'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${!filterType ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => setFilterType(null)}
            >
              All Types
            </Button>
            {taskTypes.map((type) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${filterType === type ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                style={{
                  backgroundColor: typeColors[type] || '#f5f5f5',
                  color: '#000000',
                  fontWeight: filterType === type ? 'bold' : 'normal',
                }}
                onClick={() => setFilterType(type)}
              >
                {capitalizeWords(type)}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" /> {/* Spacer */}

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full text-xs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            Sort by {sortBy}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${sortBy === 'date' ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => {
                setSortBy('date');
                setSortDirection(sortBy === 'date' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
              }}
            >
              Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${sortBy === 'title' ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => {
                setSortBy('title');
                setSortDirection(sortBy === 'title' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
              }}
            >
              Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${sortBy === 'type' ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => {
                setSortBy('type');
                setSortDirection(sortBy === 'type' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
              }}
            >
              Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 