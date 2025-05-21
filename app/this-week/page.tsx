import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { ThisWeekView } from "@/components/this-week/this-week-view"

export default function ThisWeekPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <ThisWeekView />
      </main>
    </div>
  )
}
