import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { NoteDetail } from "@/components/notes/note-detail"

export default function NotePage({ params }: { params: { id: string; noteId: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <NoteDetail classId={params.id} noteId={params.noteId} />
      </main>
    </div>
  )
}
