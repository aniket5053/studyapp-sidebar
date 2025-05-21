import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { ClassDetail } from "@/components/classes/class-detail"

export default function ClassPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <ClassDetail id={params.id} />
      </main>
    </div>
  )
}
