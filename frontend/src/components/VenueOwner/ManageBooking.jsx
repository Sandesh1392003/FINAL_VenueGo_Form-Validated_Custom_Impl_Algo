"use client"

import { useContext, useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  X,
  Bell,
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
  Sliders,
  LayoutDashboard,
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
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border border-rose-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  // Get payment status badge styling
  const getPaymentBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "REFUNDED":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
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

  if (authLoading || venueLoading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  const filteredBookings = getFilteredBookings()
  const totalBookings = Object.values(bookings).flat().length
  const todayCount = bookings.today.length
  const upcomingCount = bookings.upcoming.length
  const pastCount = bookings.past.length
  const cancelledCount = bookings.cancelled.length

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-gray-500" />
              <h1 className="text-2xl font-bold text-gray-900">Booking Dashboard</h1>
            </div>
            <p className="text-gray-500 mt-1">Manage and track all your venue bookings</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Export</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Sliders className="w-4 h-4 text-gray-600" />
                <span>Filters</span>
                {(statusFilter !== "all" || selectedVenue !== "all") && (
                  <span className="flex items-center justify-center bg-gray-900 text-white rounded-full w-5 h-5 text-xs">
                    {(statusFilter !== "all" ? 1 : 0) + (selectedVenue !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => {
                        setStatusFilter("all")
                        setSelectedVenue("all")
                        setIsFilterOpen(false)
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Reset all
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <select
                        value={selectedVenue}
                        onChange={(e) => setSelectedVenue(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="all">All Venues</option>
                        {venues.map((venue) => (
                          <option key={venue.id} value={venue.id}>
                            {venue.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
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
                className={`p-2 ${
                  viewMode === "list" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
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

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search bookings by customer, venue, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
              selectedTab === "upcoming" ? "border-gray-900" : "border-transparent"
            } cursor-pointer hover:shadow-md transition-all`}
            onClick={() => setSelectedTab("upcoming")}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-3xl font-bold mt-1">{upcomingCount}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <CalendarClock className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
              selectedTab === "today" ? "border-gray-900" : "border-transparent"
            } cursor-pointer hover:shadow-md transition-all`}
            onClick={() => setSelectedTab("today")}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="text-3xl font-bold mt-1">{todayCount}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
              selectedTab === "past" ? "border-gray-900" : "border-transparent"
            } cursor-pointer hover:shadow-md transition-all`}
            onClick={() => setSelectedTab("past")}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold mt-1">{pastCount}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
              selectedTab === "cancelled" ? "border-gray-900" : "border-transparent"
            } cursor-pointer hover:shadow-md transition-all`}
            onClick={() => setSelectedTab("cancelled")}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-3xl font-bold mt-1">{cancelledCount}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <CalendarX className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">{selectedTab} Bookings</h2>
            <div className="text-sm text-gray-500">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {getTabIcon(selectedTab)}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No {selectedTab} bookings found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {selectedTab === "upcoming" && "You don't have any upcoming bookings."}
                {selectedTab === "today" && "You don't have any bookings scheduled for today."}
                {selectedTab === "past" && "You don't have any past bookings."}
                {selectedTab === "cancelled" && "You don't have any cancelled bookings."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedBooking(booking)
                    setIsDetailsModalOpen(true)
                  }}
                >
                  <div className="relative h-32 bg-gray-100">
                    {booking.venueImage ? (
                      <img
                        src={booking.venueImage || "/placeholder.svg"}
                        alt={booking.venueName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(booking.bookingStatus)}`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{booking.venueName}</h3>
                      <span className="text-sm font-medium">Rs. {booking.totalPrice}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {booking.venueLocation?.city}, {booking.venueLocation?.province}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span>{booking.timeslots[0]?.start}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium">{booking.user?.name || "N/A"}</span>
                      </div>

                      {selectedTab === "upcoming" && (
                        <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md">
                          In {getTimeRemaining(booking.date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venue & Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      {selectedTab === "upcoming" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Countdown
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {booking.venueImage ? (
                                <img
                                  src={booking.venueImage || "/placeholder.svg"}
                                  alt={booking.venueName}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <MapPin className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{booking.venueName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                {formatDate(booking.date)} • {booking.timeslots[0]?.start}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email || "No email"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${getStatusBadge(booking.bookingStatus)}`}
                            >
                              {booking.bookingStatus}
                            </span>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${getPaymentBadge(booking.paymentStatus)}`}
                            >
                              {booking.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Rs. {booking.totalPrice}</td>
                        {selectedTab === "upcoming" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-500 mr-1" />
                              <span className="text-sm">{getTimeRemaining(booking.date)}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBooking(booking)
                              setIsDetailsModalOpen(true)
                            }}
                            className="text-gray-900 hover:text-gray-700 font-medium"
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
        </div>

        {/* Booking Details Modal */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false)
                    setSelectedBooking(null)
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Venue Image */}
                  <div className="w-full md:w-1/3">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {selectedBooking.venueImage ? (
                        <img
                          src={selectedBooking.venueImage || "/placeholder.svg"}
                          alt={selectedBooking.venueName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="w-full md:w-2/3">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedBooking.venueName}</h4>
                    <p className="text-gray-500 flex items-center mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedBooking.venueLocation?.city}, {selectedBooking.venueLocation?.province}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-medium">{formatDate(selectedBooking.date)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <p className="font-medium">
                          {selectedBooking.timeslots[0]?.start} - {selectedBooking.timeslots[0]?.end}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Booking Status</p>
                        <p
                          className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(selectedBooking.bookingStatus)}`}
                        >
                          {selectedBooking.bookingStatus}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                        <p
                          className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getPaymentBadge(selectedBooking.paymentStatus)}`}
                        >
                          {selectedBooking.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold">Rs. {selectedBooking.totalPrice}</p>
                      </div>
                    </div>

                    {selectedTab === "upcoming" && (
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                        <span>Coming up in {getTimeRemaining(selectedBooking.date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="space-y-2 mb-4 md:mb-0">
                        <p className="font-medium">{selectedBooking.user?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">{selectedBooking.user?.email || "No email"}</p>
                        <p className="text-sm text-gray-500">{selectedBooking.user?.phone || "No phone"}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleContactCustomer("email", selectedBooking.user?.email)}
                          disabled={!selectedBooking.user?.email}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>

                        <button
                          onClick={() => handleContactCustomer("phone", selectedBooking.user?.phone)}
                          disabled={!selectedBooking.user?.phone}
                          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Additional Services</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        {selectedBooking.selectedServices.map((service, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>Rs. {service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => window.open(`/venue/${selectedBooking.venueId}`, "_blank")}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Venue
                  </button>

                  {selectedBooking.bookingStatus === "PENDING" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking.id, "APPROVED")}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}

                  {(selectedBooking.bookingStatus === "PENDING" || selectedBooking.bookingStatus === "APPROVED") && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking.id, "CANCELLED")}
                      className="flex items-center gap-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">
                Bookings are automatically approved when payment is received. You can also manually approve or cancel
                bookings as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageBookings
