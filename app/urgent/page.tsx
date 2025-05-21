import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { UrgentView } from "@/components/urgent/urgent-view"

export default function UrgentPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <UrgentView />
      </main>
    </div>
  )
}
