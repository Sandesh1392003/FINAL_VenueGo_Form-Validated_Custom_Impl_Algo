"use client"

import { useContext, useState, useEffect } from "react"
import { LogOut, Home, Calendar, Settings, Menu, X, User, Bell, ChevronDown } from "lucide-react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import getOptimizedCloudinaryUrl from "../Functions/OptimizedImageUrl"

const User_Layout = () => {
  const { user, logout, loading } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest(".user-menu-container")) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  if (loading) return <Loader />

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?")
    if (!confirmed) return

    logout()
    setTimeout(() => {
      window.location.href = "/"
    }, 200)
  }

  const profileImageUrl = getOptimizedCloudinaryUrl(user?.profileImg?.secure_url) || "https://picsum.photos/200"

  const navigationItems = [
    {
      to: "/Home",
      icon: Home,
      label: "Dashboard",
      end: true,
    },
    {
      to: "/Home/my-bookings",
      icon: Calendar,
      label: "My Bookings",
    },
    {
      to: "/Home/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div
        className={`bg-white w-72 shadow-xl fixed h-full z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 border-r border-slate-100`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <a href="/Home" className="flex items-center">
                <div className="w-24 h-14 flex items-center justify-center bg-white rounded-xl shadow-md overflow-hidden">
                  <img
                    className="w-22 h-13 object-contain"
                    src={
                      getOptimizedCloudinaryUrl(
                        "https://res.cloudinary.com/dehb6hq4r/image/upload/v1749539851/6215054948941549032_upvumw.jpg",
                      ) || "/placeholder.svg"
                    }
                    alt="VenueGo Logo"
                  />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  VenueGo
                </span>
              </a>
            </div>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 rounded-xl text-base font-medium transition-all duration-300 ${isActive
                    ? "text-purple-700 bg-purple-50 shadow-sm"
                    : "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                  }`
                }
              >
                <item.icon className="mr-3 text-purple-600" size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="User Avatar"
                className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
              />
              <div className="ml-3 flex-1">
                <p className="text-slate-900 font-semibold text-sm">{user?.name}</p>
                <p className="text-slate-500 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center py-3 px-4 mt-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-72">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-100">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <div className="flex-1 px-4">
              <h1 className="text-2xl font-bold text-slate-900">
                {location.pathname === "/Home" && "Dashboard"}
                {location.pathname === "/Home/my-bookings" && "My Bookings"}
                {location.pathname === "/Home/settings" && "Settings"}
                {!navigationItems.some((item) => item.to === location.pathname) && "VenueGo"}
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative user-menu-container">
              <button
                onClick={toggleUserMenu}
                className="flex items-center p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <img
                  src={profileImageUrl || "/placeholder.svg"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-lg border border-slate-200"
                />
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      onClick={() => {
                        navigate("/Home/settings")
                        setUserMenuOpen(false)
                      }}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      onClick={() => {
                        // Handle notifications
                        setUserMenuOpen(false)
                      }}
                    >
                      <Bell className="mr-3 h-4 w-4" />
                      Notifications
                    </button>
                  </div>
                  <div className="py-1 border-t border-slate-100">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleLogout()
                        setUserMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-purple-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default User_Layout
