"use client"

import { useContext, useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, UserCircle, X } from "lucide-react"
import { AuthContext } from "../../../middleware/AuthContext"

const Header = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user } = useContext(AuthContext)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight
      const threshold = viewportHeight * 0.01 // 1vh

      setIsScrolled(scrollPosition > threshold)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`shadow-md sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200"
          : "bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900"
        }`}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? "text-purple-800" : "text-white"
              }`}
          >
            <a href="/">VenueGo</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-700 hover:text-purple-800"
                  : isActive
                    ? "text-purple-300 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-700 hover:text-purple-800"
                  : isActive
                    ? "text-purple-300 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-700 hover:text-purple-800"
                  : isActive
                    ? "text-purple-300 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-700 hover:text-purple-800"
                  : isActive
                    ? "text-purple-300 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-2">
            {isAuthenticated && user ? (
              <button
                className={`px-4 py-2 rounded cursor-pointer font-medium transition-all duration-300 ${isScrolled
                    ? "bg-purple-50 hover:text-purple-600 hover:bg-purple-100 text-gray-700"
                    : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  }`}
                onClick={() => navigate("/Home")}
              >
                <UserCircle
                  className={`inline-block mr-2 transition-colors duration-300 ${isScrolled ? "text-purple-500" : "text-purple-300"
                    }`}
                  size={20}
                />
                {user.name}
              </button>
            ) : (
              <>
                <button
                  className={`px-4 py-2 cursor-pointer transition-all duration-300 ${isScrolled ? "text-gray-700 hover:text-purple-800" : "text-gray-300 hover:text-white"
                    }`}
                  onClick={() => navigate("/Login")}
                >
                  Log In
                </button>
                <button
                  className={`px-4 py-2 rounded cursor-pointer transition-all duration-300 ${isScrolled
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg"
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
            className={`md:hidden p-2 rounded-lg transition-all duration-300 ${isScrolled ? "hover:bg-purple-200 text-purple-600" : "hover:bg-white/10 text-white"
              }`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden transition-all duration-300 ease-in-out ${isScrolled
              ? "bg-white border-t border-gray-200 mt-3"
              : "bg-gradient-to-b from-purple-900/50 to-indigo-900/50 backdrop-blur-md mt-3"
            }`}
        >
          <div className="pt-4 pb-3 space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-all duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold bg-purple-50"
                    : "text-gray-700 hover:text-purple-800 hover:bg-purple-50"
                  : isActive
                    ? "text-purple-300 font-semibold bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-all duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold bg-purple-50"
                    : "text-gray-700 hover:text-purple-800 hover:bg-purple-50"
                  : isActive
                    ? "text-purple-300 font-semibold bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`
              }
              onClick={closeMenu}
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-all duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold bg-purple-50"
                    : "text-gray-700 hover:text-purple-800 hover:bg-purple-50"
                  : isActive
                    ? "text-purple-300 font-semibold bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`
              }
              onClick={closeMenu}
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-all duration-300 ${isScrolled
                  ? isActive
                    ? "text-purple-600 font-semibold bg-purple-50"
                    : "text-gray-700 hover:text-purple-800 hover:bg-purple-50"
                  : isActive
                    ? "text-purple-300 font-semibold bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`
              }
              onClick={closeMenu}
            >
              Contact
            </NavLink>

            {/* Mobile Auth Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {isAuthenticated && user ? (
                <button
                  className={`col-span-2 px-4 py-2 cursor-pointer rounded font-medium transition-all duration-300 ${isScrolled
                      ? "bg-purple-50 hover:text-purple-600 hover:bg-purple-100 text-gray-700"
                      : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                    }`}
                  onClick={() => {
                    navigate("/Home")
                    closeMenu()
                  }}
                >
                  <UserCircle
                    className={`inline-block mr-2 transition-colors duration-300 ${isScrolled ? "text-purple-500" : "text-purple-300"
                      }`}
                    size={20}
                  />
                  {user.name}
                </button>
              ) : (
                <>
                  <button
                    className={`px-4 py-2 border rounded transition-all duration-300 ${isScrolled
                        ? "text-gray-700 hover:text-purple-800 border-gray-300 hover:bg-purple-50"
                        : "text-gray-300 hover:text-white border-white/30 hover:bg-white/10"
                      }`}
                    onClick={() => {
                      navigate("/Login")
                      closeMenu()
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    onClick={() => {
                      navigate("/Signup")
                      closeMenu()
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
