import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { SearchView } from "@/components/search/search-view"

export default function SearchPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <SearchView />
      </main>
    </div>
  )
}
