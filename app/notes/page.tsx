import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { NotesView } from "@/components/notes/notes-view"

export default function NotesPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <NotesView />
      </main>
    </div>
  )
}
