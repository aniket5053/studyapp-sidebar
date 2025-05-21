import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { CalendarView } from "@/components/calendar/calendar-view"

export default function CalendarPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <CalendarView />
      </main>
    </div>
  )
}
