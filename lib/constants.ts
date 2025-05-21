// Task type colors
export const TASK_TYPE_COLORS = {
  homework: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dark: {
      bg: 'dark:bg-blue-900/40',
      text: 'dark:text-blue-100',
      border: 'dark:border-blue-800'
    }
  },
  quiz: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dark: {
      bg: 'dark:bg-purple-900/40',
      text: 'dark:text-purple-100',
      border: 'dark:border-purple-800'
    }
  },
  exam: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dark: {
      bg: 'dark:bg-red-900/40',
      text: 'dark:text-red-100',
      border: 'dark:border-red-800'
    }
  },
  lab: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dark: {
      bg: 'dark:bg-green-900/40',
      text: 'dark:text-green-100',
      border: 'dark:border-green-800'
    }
  },
  reading: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dark: {
      bg: 'dark:bg-amber-900/40',
      text: 'dark:text-amber-100',
      border: 'dark:border-amber-800'
    }
  },
  project: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dark: {
      bg: 'dark:bg-indigo-900/40',
      text: 'dark:text-indigo-100',
      border: 'dark:border-indigo-800'
    }
  },
  default: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dark: {
      bg: 'dark:bg-slate-900/40',
      text: 'dark:text-slate-100',
      border: 'dark:border-slate-800'
    }
  }
} as const

// Class colors (these should match the colors in your data)
export const CLASS_COLORS = {
  cs: '#3B82F6', // blue-500
  math: '#8B5CF6', // violet-500
  phys: '#EC4899', // pink-500
  chem: '#10B981', // emerald-500
  bio: '#F59E0B', // amber-500
  hist: '#EF4444', // red-500
  eng: '#6366F1', // indigo-500
  default: '#64748B' // slate-500
} as const

// Get color classes for a task type
export function getTaskTypeColors(type: string) {
  const colors = TASK_TYPE_COLORS[type as keyof typeof TASK_TYPE_COLORS] || TASK_TYPE_COLORS.default
  return `${colors.bg} ${colors.text} ${colors.border} ${colors.dark.bg} ${colors.dark.text} ${colors.dark.border}`
}

// Get color for a class
export function getClassColor(classId: string) {
  return CLASS_COLORS[classId as keyof typeof CLASS_COLORS] || CLASS_COLORS.default
} 