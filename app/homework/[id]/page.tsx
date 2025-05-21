import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { HomeworkDetail } from "@/components/homework/homework-detail"

export default function HomeworkPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <HomeworkDetail id={params.id} />
      </main>
    </div>
  )
}
