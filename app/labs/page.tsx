import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { LabsList } from "@/components/labs/labs-list"

export default function LabsPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <LabsList />
      </main>
    </div>
  )
}
