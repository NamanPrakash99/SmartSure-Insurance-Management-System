import Navbar from './Navbar'
import Footer from './Footer'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
