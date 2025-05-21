import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { AddClassForm } from "@/components/classes/add-class-form"

export default function AddClassPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <AddClassForm />
      </main>
    </div>
  )
}
