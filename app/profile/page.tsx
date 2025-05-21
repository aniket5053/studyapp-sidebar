import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { ProfileView } from "@/components/profile/profile-view"

export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <ProfileView />
      </main>
    </div>
  )
}
