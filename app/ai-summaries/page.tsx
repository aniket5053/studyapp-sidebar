import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { AISummariesView } from "@/components/ai-summaries/ai-summaries-view"

export default function AISummariesPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <AISummariesView />
      </main>
    </div>
  )
}
