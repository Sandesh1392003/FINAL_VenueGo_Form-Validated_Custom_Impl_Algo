"use client"

import { useContext, useState, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { Menu, UserCircle, X, ChevronDown, LogOut, Settings, Heart, Calendar, Building } from "lucide-react"
import { AuthContext } from "../../../middleware/AuthContext"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { isAuthenticated, user } = useContext(AuthContext)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const closeUserMenu = () => {
    setIsUserMenuOpen(false)
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        closeUserMenu()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu()
  }, [location])

  const isHomePage = location.pathname === "/"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHomePage ? "bg-white shadow-md" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-6">
        <nav className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <a href="/" className="flex items-center">
              <span
                className={`bg-gradient-to-r ${isScrolled || !isHomePage ? "from-purple-700 to-indigo-700" : "from-white to-purple-200"
                  } bg-clip-text text-transparent transition-all duration-300`}
              >
                VenueGo
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${isActive
                  ? isScrolled || !isHomePage
                    ? "text-purple-700 bg-purple-50"
                    : "text-white bg-white/20 backdrop-blur-sm"
                  : isScrolled || !isHomePage
                    ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                    : "text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${isActive
                  ? isScrolled || !isHomePage
                    ? "text-purple-700 bg-purple-50"
                    : "text-white bg-white/20 backdrop-blur-sm"
                  : isScrolled || !isHomePage
                    ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                    : "text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                }`
              }
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${isActive
                  ? isScrolled || !isHomePage
                    ? "text-purple-700 bg-purple-50"
                    : "text-white bg-white/20 backdrop-blur-sm"
                  : isScrolled || !isHomePage
                    ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                    : "text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${isActive
                  ? isScrolled || !isHomePage
                    ? "text-purple-700 bg-purple-50"
                    : "text-white bg-white/20 backdrop-blur-sm"
                  : isScrolled || !isHomePage
                    ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                    : "text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative user-menu-container">
                <button
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-xl transition-all duration-300 ${isScrolled || !isHomePage
                      ? "text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200"
                      : "text-white hover:bg-white/20 backdrop-blur-sm border border-white/30"
                    }`}
                  onClick={toggleUserMenu}
                >
                  <UserCircle className="mr-2 h-5 w-5" />
                  <span>{user.name}</span>
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                        onClick={() => {
                          navigate("/dashboard")
                          closeUserMenu()
                        }}
                      >
                        <Building className="mr-3 h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                        onClick={() => {
                          navigate("/bookings")
                          closeUserMenu()
                        }}
                      >
                        <Calendar className="mr-3 h-4 w-4" />
                        My Bookings
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                        onClick={() => {
                          navigate("/favorites")
                          closeUserMenu()
                        }}
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Favorites
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                        onClick={() => {
                          navigate("/settings")
                          closeUserMenu()
                        }}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                    </div>
                    <div className="py-1 border-t border-slate-100">
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          // Handle logout
                          closeUserMenu()
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className={`px-4 py-2 text-base font-medium rounded-xl transition-all duration-300 ${isScrolled || !isHomePage
                      ? "text-slate-700 hover:text-purple-700"
                      : "text-white/90 hover:text-white"
                    }`}
                  onClick={() => navigate("/Login")}
                >
                  Log In
                </button>
                <button
                  className={`px-6 py-2 text-base font-medium rounded-xl transition-all duration-300 ${isScrolled || !isHomePage
                      ? "text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                      : "text-purple-900 bg-white hover:bg-purple-50 shadow-md"
                    }`}
                  onClick={() => navigate("/Signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${isScrolled || !isHomePage
                ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
                : "text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden bg-white shadow-lg`}
      >
        <div className="container mx-auto px-6 py-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "text-purple-700 bg-purple-50" : "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
              }`
            }
            onClick={closeMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/Venues"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "text-purple-700 bg-purple-50" : "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
              }`
            }
            onClick={closeMenu}
          >
            Venues
          </NavLink>
          <NavLink
            to="/How-it-works"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "text-purple-700 bg-purple-50" : "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
              }`
            }
            onClick={closeMenu}
          >
            How It Works
          </NavLink>
          <NavLink
            to="/Contact"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "text-purple-700 bg-purple-50" : "text-slate-700 hover:text-purple-700 hover:bg-purple-50"
              }`
            }
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          {/* Mobile Auth */}
          <div className="pt-4 pb-2 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-4 py-2">
                  <p className="text-base font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <button
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => {
                    navigate("/dashboard")
                    closeMenu()
                  }}
                >
                  <Building className="mr-3 h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => {
                    navigate("/bookings")
                    closeMenu()
                  }}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  <span>My Bookings</span>
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => {
                    navigate("/settings")
                    closeMenu()
                  }}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  <span>Settings</span>
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  onClick={() => {
                    // Handle logout
                    closeMenu()
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="px-4 py-3 text-base font-medium text-slate-700 rounded-xl border border-slate-200 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  onClick={() => {
                    navigate("/Login")
                    closeMenu()
                  }}
                >
                  Log In
                </button>
                <button
                  className="px-4 py-3 text-base font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                  onClick={() => {
                    navigate("/Signup")
                    closeMenu()
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
