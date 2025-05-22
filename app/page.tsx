import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { UnifiedTaskBoard } from "@/components/tasks/unified-task-board"
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets"

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto shadow-[0_0_15px_rgba(0,0,0,0.1)]">
        <DashboardWidgets />
        <UnifiedTaskBoard title="Dashboard" />
      </main>
    </div>
  )
}
