"use client"

import { useState, useEffect, useContext } from "react"
import { Menu, X, Building, Calendar, PlusCircle, Settings, LogOut, BadgeHelp } from "lucide-react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"

export default function VendorLayout() {
  const { user, loading, logout } = useContext(AuthContext)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure?")
    if (!confirmed) return

    logout()
    setTimeout(() => {
      window.location.href = "/"
    }, 200)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (loading) return <Loader />

  if (!user) return <p>User not found or not logged in.</p>

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-purple-100/50`}
      >
        <div className="flex flex-col h-full relative">
          {/* Sidebar Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 to-indigo-50/30 pointer-events-none"></div>

          {/* Logo - KEPT EXACTLY AS ORIGINAL */}
          <div className="flex items-center justify-center h-16">
            <NavLink to="/Dashboard" className="flex items-center">
              <img
                className="h-9 w-auto rounded-full overflow-hidden"
                src="https://res.cloudinary.com/dehb6hq4r/image/upload/v1749539851/6215054948941549032_upvumw.jpg"
                alt="VenueGo Logo"
              />
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 relative z-10">
            <Link href="my-venues" icon={<Building className="h-5 w-5" />}>
              My Venues
            </Link>
            <Link href="bookings" icon={<Calendar className="h-5 w-5" />}>
              Bookings
            </Link>
            <Link href="add-venue" icon={<PlusCircle className="h-5 w-5" />}>
              Add Venue
            </Link>
            <Link href="help&support" icon={<BadgeHelp className="h-5 w-5" />}>
              Help & Support
            </Link>
          </nav>

          {/* User Profile and Logout */}
          <div className="p-4 border-t border-purple-100/50 relative z-10 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
            <div className="flex items-center mb-4 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative">
                <img
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200/50"
                  src={user?.profileImg?.secure_url || "https://picsum.photos/id/237/200/300"}
                  alt={user.name}
                />
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-purple-600/70">{user.email}</div>
              </div>
            </div>
            <Link href="settings" icon={<Settings className="h-5 w-5" />}>
              Settings
            </Link>
            <button onClick={handleLogout} className="w-full">
              <Link href="#" icon={<LogOut className="h-5 w-5" />}>
                Sign out
              </Link>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-purple-100/50">
          <div className="px-4 py-2 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              type="button"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-xl focus:outline-none transition-all duration-300 lg:hidden group"
            >
              <span className="sr-only">Toggle sidebar</span>
              {isSidebarOpen ? (
                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent lg:hidden">
              VenueGo
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50/50 via-purple-50/50 to-indigo-50/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  )
}

function Link({ href, icon, children }) {
  return (
    <NavLink
      to={`/Dashboard/${href}`}
      className={({ isActive }) =>
        `flex items-center px-3 py-3 mt-2 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
          ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 transform scale-105"
          : "text-gray-700 hover:text-purple-700 hover:bg-white/60 hover:shadow-md hover:scale-102"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Animated background for active state */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl blur-sm"></div>
          )}

          <span
            className={`relative z-10 transition-all duration-300 ${isActive ? "text-white" : "text-purple-600 group-hover:scale-110"}`}
          >
            {icon}
          </span>
          <span className="relative z-10 ml-3 font-semibold">{children}</span>
        </>
      )}
    </NavLink>
  )
}
