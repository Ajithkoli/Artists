import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.02] dark:opacity-[0.05]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08)_0%,transparent_60%)] pointer-events-none"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/15 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-500/10 dark:bg-secondary-500/15 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
