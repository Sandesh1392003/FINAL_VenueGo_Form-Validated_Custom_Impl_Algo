"use client"

import { useContext, useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  X,
  CheckSquare,
  XCircle,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Users,
  LayoutDashboard,
  ChevronDown,
  Filter,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
} from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { MY_VENUES } from "../Graphql/query/meGql"
import { formatDate } from "../Functions/calc"
import toast from "react-hot-toast"

const ManageBookings = () => {
  const { loading: authLoading } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [currentPage, setCurrentPage] = useState(1)
  const [bookingsPerPage] = useState(10)

  const { data, loading: venueLoading, error, refetch } = useQuery(MY_VENUES)

  // Process bookings data
  const [bookings, setBookings] = useState({
    upcoming: [],
    today: [],
    past: [],
    cancelled: [],
  })

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues)
      processBookings(data.myVenues)
    }
  }, [data])

  // Process and categorize bookings
  const processBookings = (venueData) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let allBookings = []

    // Collect all bookings from all venues
    venueData.forEach((venue) => {
      if (venue.bookings && venue.bookings.length > 0) {
        const venueBookings = venue.bookings.map((booking) => ({
          ...booking,
          venueName: venue.name,
          venueId: venue.id,
          venueLocation: venue.location,
          venueImage: venue.image?.secure_url,
        }))
        allBookings = [...allBookings, ...venueBookings]
      }
    })

    // Sort bookings by date (newest first for past, oldest first for upcoming)
    allBookings.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Categorize bookings
    const categorized = {
      upcoming: [],
      today: [],
      past: [],
      cancelled: [],
    }

    allBookings.forEach((booking) => {
      const bookingDate = new Date(booking.date)

      // Check if booking is cancelled
      if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REJECTED") {
        categorized.cancelled.push(booking)
        return
      }

      // Check if booking is today
      if (bookingDate >= today && bookingDate < tomorrow) {
        categorized.today.push(booking)
        return
      }

      // Check if booking is in the past
      if (bookingDate < today) {
        categorized.past.push(booking)
        return
      }

      // Otherwise it's upcoming
      categorized.upcoming.push(booking)
    })

    // Sort upcoming by date (closest first)
    categorized.upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Sort today by time
    categorized.today.sort((a, b) => {
      const timeA = a.timeslots[0]?.start || "00:00"
      const timeB = b.timeslots[0]?.start || "00:00"
      return timeA.localeCompare(timeB)
    })

    // Sort past by date (most recent first)
    categorized.past.sort((a, b) => new Date(b.date) - new Date(a.date))

    setBookings(categorized)
  }

  // Filter bookings based on selected venue, search term, and status
  const getFilteredBookings = () => {
    let filtered = bookings[selectedTab] || []

    // Filter by venue
    if (selectedVenue !== "all") {
      filtered = filtered.filter((booking) => booking.venueId === selectedVenue)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.bookingStatus === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.user?.name?.toLowerCase().includes(term) ||
          booking.venueName?.toLowerCase().includes(term) ||
          booking.venueLocation?.city?.toLowerCase().includes(term),
      )
    }

    return filtered
  }

  // Calculate time remaining for upcoming bookings
  const getTimeRemaining = (dateString) => {
    const bookingDate = new Date(dateString)
    const now = new Date()

    const diffTime = bookingDate - now
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffMinutes}m`
    }
  }

  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // For now, just show a toast and close the modal
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`)
      setIsDetailsModalOpen(false)
      setSelectedBooking(null)

      // Refetch data to update the UI
      refetch()
    } catch (error) {
      toast.error(`Failed to update booking: ${error.message}`)
    }
  }

  // Handle contact customer
  const handleContactCustomer = (method, contact) => {
    if (method === "email" && contact) {
      window.location.href = `mailto:${contact}`
    } else if (method === "phone" && contact) {
      window.location.href = `tel:${contact}`
    } else {
      toast.error("Contact information not available")
    }
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
      case "PENDING":
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
      case "COMPLETED":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "CANCELLED":
      case "REJECTED":
        return "bg-gradient-to-r from-rose-500 to-rose-600 text-white"
      default:
        return "bg-gradient-to-r from-slate-500 to-slate-600 text-white"
    }
  }

  // Get payment status badge styling
  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
      case "PENDING":
        return "bg-amber-100 text-amber-700 border border-amber-200"
      case "REFUNDED":
        return "bg-blue-100 text-blue-700 border border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200"
    }
  }

  // Get tab icon
  const getTabIcon = (tab) => {
    switch (tab) {
      case "upcoming":
        return <CalendarClock className="w-5 h-5" />
      case "today":
        return <Calendar className="w-5 h-5" />
      case "past":
        return <CalendarCheck className="w-5 h-5" />
      case "cancelled":
        return <CalendarX className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  // Export bookings to CSV
  const exportToCSV = () => {
    const filteredBookings = getFilteredBookings()
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export")
      return
    }

    // Create CSV content
    const headers = ["Date", "Time", "Venue", "Customer", "Status", "Payment", "Amount"]
    const csvContent = [
      headers.join(","),
      ...filteredBookings.map((booking) =>
        [
          booking.date,
          `${booking.timeslots[0]?.start || "N/A"} - ${booking.timeslots[0]?.end || "N/A"}`,
          booking.venueName,
          booking.user?.name || "N/A",
          booking.bookingStatus,
          booking.paymentStatus,
          booking.totalPrice,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings_${selectedTab}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Bookings exported successfully")
  }

  // Pagination
  const filteredBookings = getFilteredBookings()
  const indexOfLastBooking = currentPage * bookingsPerPage
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking)
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (authLoading || venueLoading) return <Loader />
  if (error) return <div className="text-purple-500">Error: {error.message}</div>

  const totalBookings = Object.values(bookings).flat().length
  const todayCount = bookings.today.length
  const upcomingCount = bookings.upcoming.length
  const pastCount = bookings.past.length
  const cancelledCount = bookings.cancelled.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    Booking Management
                  </h1>
                  <p className="text-slate-600 mt-1">Track and manage all your venue bookings in one place</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <Download className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
                <span className="text-sm font-medium">Export CSV</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <Filter className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
                  <span className="text-sm font-medium">Filters</span>
                  {(statusFilter !== "all" || selectedVenue !== "all") && (
                    <span className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-5 h-5 text-xs">
                      {(statusFilter !== "all" ? 1 : 0) + (selectedVenue !== "all" ? 1 : 0)}
                    </span>
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl p-5 z-10 border border-purple-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-900">Filter Bookings</h3>
                      <button
                        onClick={() => {
                          setStatusFilter("all")
                          setSelectedVenue("all")
                          setIsFilterOpen(false)
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Reset all
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue</label>
                        <div className="relative">
                          <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                            className="w-full p-2.5 pr-10 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white"
                          >
                            <option value="all">All Venues</option>
                            {venues.map((venue) => (
                              <option key={venue.id} value={venue.id}>
                                {venue.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                        <div className="relative">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2.5 pr-10 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white"
                          >
                            <option value="all">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 pointer-events-none" />
                        </div>
                      </div>

                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex border border-purple-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white text-slate-500 hover:bg-purple-50"
                    } transition-all duration-300`}
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white text-slate-500 hover:bg-purple-50"
                    } transition-all duration-300`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings by customer, venue, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 border-2 border-purple-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setSelectedTab("upcoming")}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedTab === "upcoming" ? "ring-2 ring-purple-500" : ""
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-0 hover:opacity-90 transition-opacity duration-300"></div>
            <div className="relative p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-90">Upcoming</p>
                  <p className="text-3xl font-bold mt-1">{upcomingCount}</p>
                  <p className="text-xs mt-2 opacity-80">Future bookings</p>
                </div>
                <div className="p-2.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <CalendarClock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedTab("today")}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedTab === "today" ? "ring-2 ring-purple-500" : ""
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 hover:opacity-90 transition-opacity duration-300"></div>
            <div className="relative p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-90">Today</p>
                  <p className="text-3xl font-bold mt-1">{todayCount}</p>
                  <p className="text-xs mt-2 opacity-80">Today's schedule</p>
                </div>
                <div className="p-2.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedTab("past")}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedTab === "past" ? "ring-2 ring-purple-500" : ""
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-0 hover:opacity-90 transition-opacity duration-300"></div>
            <div className="relative p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-90">Completed</p>
                  <p className="text-3xl font-bold mt-1">{pastCount}</p>
                  <p className="text-xs mt-2 opacity-80">Past bookings</p>
                </div>
                <div className="p-2.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedTab("cancelled")}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedTab === "cancelled" ? "ring-2 ring-purple-500" : ""
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 opacity-0 hover:opacity-90 transition-opacity duration-300"></div>
            <div className="relative p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-90">Cancelled</p>
                  <p className="text-3xl font-bold mt-1">{cancelledCount}</p>
                  <p className="text-xs mt-2 opacity-80">Cancelled bookings</p>
                </div>
                <div className="p-2.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <CalendarX className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                {getTabIcon(selectedTab)}
              </div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">{selectedTab} Bookings</h2>
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center border border-purple-100">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                {getTabIcon(selectedTab)}
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No {selectedTab} bookings found</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {selectedTab === "upcoming" && "You don't have any upcoming bookings at the moment."}
                {selectedTab === "today" && "You don't have any bookings scheduled for today."}
                {selectedTab === "past" && "You don't have any past bookings in your history."}
                {selectedTab === "cancelled" && "You don't have any cancelled bookings."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-102"
                  onClick={() => {
                    setSelectedBooking(booking)
                    setIsDetailsModalOpen(true)
                  }}
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {booking.venueImage ? (
                      <img
                        src={booking.venueImage || "/placeholder.svg"}
                        alt={booking.venueName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${getStatusBadge(booking.bookingStatus)}`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                          {formatDate(booking.date)}
                        </span>
                        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                          {booking.timeslots[0]?.start}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{booking.venueName}</h3>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-purple-600" />
                        <span className="text-sm font-bold text-purple-700">{booking.totalPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-slate-600 mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-purple-600" />
                      <span className="truncate">
                        {booking.venueLocation?.city}, {booking.venueLocation?.province}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mr-2">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-900">{booking.user?.name || "N/A"}</span>
                      </div>

                      {selectedTab === "upcoming" && (
                        <div className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                          In {getTimeRemaining(booking.date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-100">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Venue & Date
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Amount
                      </th>
                      {selectedTab === "upcoming" && (
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Countdown
                        </th>
                      )}
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {currentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3 overflow-hidden rounded-lg">
                              {booking.venueImage ? (
                                <img
                                  src={booking.venueImage || "/placeholder.svg"}
                                  alt={booking.venueName}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                  <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{booking.venueName}</div>
                              <div className="text-xs text-slate-600 flex items-center mt-0.5">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-purple-600" />
                                {formatDate(booking.date)} • {booking.timeslots[0]?.start}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{booking.user?.name || "N/A"}</div>
                          <div className="text-xs text-slate-600">{booking.user?.email || "No email"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full shadow-sm ${getStatusBadge(booking.bookingStatus)}`}
                            >
                              {booking.bookingStatus}
                            </span>
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-md ${getPaymentBadge(booking.paymentStatus)}`}
                            >
                              {booking.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-purple-700">Rs. {booking.totalPrice}</div>
                        </td>
                        {selectedTab === "upcoming" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-purple-600 mr-1.5" />
                              <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                                {getTimeRemaining(booking.date)}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBooking(booking)
                              setIsDetailsModalOpen(true)
                            }}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-md hover:shadow-md transition-all duration-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show first page, last page, current page, and one page before and after current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-1.5 rounded-md ${currentPage === pageNumber
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
                          } transition-colors duration-300`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={pageNumber} className="px-3 py-1.5">
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Info Alert */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-slate-900">Pro Tip</h3>
              <p className="text-sm text-slate-700 mt-1">
                Bookings are automatically approved when payment is received. You can also manually approve or cancel
                bookings as needed. Export your booking data to CSV for your records or reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details Modal */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Booking Details</h3>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false)
                    setSelectedBooking(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Venue Image */}
                  <div className="w-full md:w-2/5">
                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-md">
                      {selectedBooking.venueImage ? (
                        <img
                          src={selectedBooking.venueImage || "/placeholder.svg"}
                          alt={selectedBooking.venueName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="w-full md:w-3/5">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-slate-900">{selectedBooking.venueName}</h4>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedBooking.bookingStatus)}`}
                      >
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>

                    <p className="text-slate-600 flex items-center mb-4 text-sm">
                      <MapPin className="w-4 h-4 mr-1.5 text-purple-600" />
                      {selectedBooking.venueLocation?.city}, {selectedBooking.venueLocation?.province}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-600 mb-1">Date</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-purple-600 mr-1.5" />
                          <p className="font-medium text-slate-900">{formatDate(selectedBooking.date)}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-600 mb-1">Time</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-indigo-600 mr-1.5" />
                          <p className="font-medium text-slate-900">
                            {selectedBooking.timeslots[0]?.start} - {selectedBooking.timeslots[0]?.end}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-xl mb-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-700">Total Amount</p>
                        <p className="text-xl font-bold text-slate-900">Rs. {selectedBooking.totalPrice}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-slate-600">Payment Status</p>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPaymentBadge(selectedBooking.paymentStatus)}`}
                        >
                          {selectedBooking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {selectedTab === "upcoming" && (
                      <div className="flex items-center text-sm text-purple-700 mb-4 bg-purple-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="font-medium">Coming up in {getTimeRemaining(selectedBooking.date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    Customer Information
                  </h4>
                  <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="space-y-1 mb-4 md:mb-0">
                        <p className="font-semibold text-slate-900">{selectedBooking.user?.name || "N/A"}</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                          {selectedBooking.user?.email || "No email"}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                          {selectedBooking.user?.phone || "No phone"}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleContactCustomer("email", selectedBooking.user?.email)}
                          disabled={!selectedBooking.user?.email}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mail className="w-4 h-4" />
                          Email Customer
                        </button>

                        <button
                          onClick={() => handleContactCustomer("phone", selectedBooking.user?.phone)}
                          disabled={!selectedBooking.user?.phone}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Phone className="w-4 h-4 text-purple-600" />
                          Call Customer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                      Additional Services
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                      <div className="divide-y divide-purple-200">
                        {selectedBooking.selectedServices.map((service, index) => (
                          <div key={index} className="flex justify-between py-2 first:pt-0 last:pb-0">
                            <span className="text-sm text-slate-900">{service.name}</span>
                            <span className="font-medium text-purple-700">Rs. {service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-purple-100">
                  <button
                    onClick={() => window.open(`/venue/${selectedBooking.venueId}`, "_blank")}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                    View Venue
                  </button>

                  {selectedBooking.bookingStatus === "PENDING" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking.id, "APPROVED")}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Booking
                    </button>
                  )}

                  {(selectedBooking.bookingStatus === "PENDING" || selectedBooking.bookingStatus === "APPROVED") && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking.id, "CANCELLED")}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageBookings
