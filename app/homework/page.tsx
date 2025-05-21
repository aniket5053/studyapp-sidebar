import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { HomeworkList } from "@/components/homework/homework-list"

export default function HomeworkPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <HomeworkList />
      </main>
    </div>
  )
}
