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
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) return;

    logout();
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };


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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
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
          <nav className="flex-1 px-2 py-4">
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
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <img className="h-10 w-10 rounded-full object-cover" src={user?.profileImg?.secure_url || "https://picsum.photos/id/237/200/300"} alt={user.name} />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <Link href="settings" icon={<Settings className="h-5 w-5" />}>
              Settings
            </Link>
            <button onClick={handleLogout}>
              <Link href="#" icon={<LogOut className="h-5 w-5" />}>
                Sign out
              </Link>

            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-100 shadow-sm">
          <div className="px-4 py-2 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 lg:hidden"
            >
              <span className="sr-only">Toggle sidebar</span>
              {isSidebarOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 lg:hidden">VenueVerse</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-20  lg:hidden" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }} onClick={toggleSidebar}></div>
      )}
    </div>
  )
}

function Link({ href, icon, children }) {
  return (
    <NavLink
      to={`/Dashboard/${href}`}
      className={({ isActive }) =>
        `flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${isActive ? "text-blue-600 font-semibold bg-gray-100" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  )
}

