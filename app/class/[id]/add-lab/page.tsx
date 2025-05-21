import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { AddLabForm } from "@/components/labs/add-lab-form"

export default function AddLabPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <AddLabForm classId={params.id} />
      </main>
    </div>
  )
}
