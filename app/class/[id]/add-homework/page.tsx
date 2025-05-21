import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { AddHomeworkForm } from "@/components/homework/add-homework-form"

export default function AddHomeworkPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <AddHomeworkForm classId={params.id} />
      </main>
    </div>
  )
}
