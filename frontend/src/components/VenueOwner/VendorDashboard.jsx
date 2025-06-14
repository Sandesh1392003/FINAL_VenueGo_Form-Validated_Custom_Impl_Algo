"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  ChevronRight,
  Clock,
  Wallet,
  Building,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { MY_VENUES } from "../Graphql/query/meGql"
import Loader from "../../pages/common/Loader"
import {
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { data, loading, error } = useQuery(MY_VENUES)
  const [activeTab, setActiveTab] = useState("overview")
  const [revenueData, setRevenueData] = useState([])
  const [bookingStatusData, setBookingStatusData] = useState([])
  const [venuePopularityData, setVenuePopularityData] = useState([])
  const [serviceUsageData, setServiceUsageData] = useState([])
  const [timeRange, setTimeRange] = useState("6m") // 1m, 3m, 6m, 1y
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (data?.myVenues) {
      // Process data for charts
      processChartData(data.myVenues)
    }
  }, [data, timeRange])

  const processChartData = (venues) => {
    // Get time range in months
    let monthsToShow = 6
    switch (timeRange) {
      case "1m":
        monthsToShow = 1
        break
      case "3m":
        monthsToShow = 3
        break
      case "6m":
        monthsToShow = 6
        break
      case "1y":
        monthsToShow = 12
        break
    }

    // 1. Revenue data by month
    const revenueByMonth = {}
    const now = new Date()

    // Initialize all months in the range with 0
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
      revenueByMonth[monthYear] = 0
    }

    venues.forEach((venue) => {
      venue.bookings.forEach((booking) => {
        const date = new Date(booking.date)
        // Only include bookings within the selected time range
        const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
        if (monthsDiff >= 0 && monthsDiff < monthsToShow) {
          const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
          if (revenueByMonth[monthYear] !== undefined) {
            revenueByMonth[monthYear] += booking.totalPrice
          }
        }
      })
    })

    const revenueChartData = Object.keys(revenueByMonth)
      .map((month) => ({
        month,
        revenue: revenueByMonth[month],
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(" ")
        const [bMonth, bYear] = b.month.split(" ")
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
      })

    setRevenueData(revenueChartData)

    // 2. Booking status distribution
    const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0, COMPLETED: 0 }
    venues.forEach((venue) => {
      venue.bookings.forEach((booking) => {
        const date = new Date(booking.date)
        const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
        if (monthsDiff >= 0 && monthsDiff < monthsToShow) {
          if (statusCounts[booking.bookingStatus] !== undefined) {
            statusCounts[booking.bookingStatus]++
          }
        }
      })
    })

    const statusData = Object.keys(statusCounts)
      .map((status) => ({
        name: status,
        value: statusCounts[status],
      }))
      .filter((item) => item.value > 0)

    setBookingStatusData(statusData)

    // 3. Venue popularity (by number of bookings)
    const venueData = venues
      .map((venue) => {
        // Filter bookings by time range
        const filteredBookings = venue.bookings.filter((booking) => {
          const date = new Date(booking.date)
          const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
          return monthsDiff >= 0 && monthsDiff < monthsToShow
        })

        return {
          name: venue.name.length > 15 ? venue.name.substring(0, 15) + "..." : venue.name,
          bookings: filteredBookings.length,
          revenue: filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
        }
      })
      .sort((a, b) => b.bookings - a.bookings)

    setVenuePopularityData(venueData)

    // 4. Service usage
    const serviceUsage = {}
    venues.forEach((venue) => {
      venue.services.forEach((service) => {
        const serviceName = service.serviceId.name
        if (!serviceUsage[serviceName]) {
          serviceUsage[serviceName] = 0
        }
        serviceUsage[serviceName]++
      })
    })

    const serviceData = Object.keys(serviceUsage)
      .map((service) => ({
        name: service,
        count: serviceUsage[service],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Show top 8 services

    setServiceUsageData(serviceData)
  }

  if (loading) return <Loader />
  if (error) return <div>Error: {error.message}</div>

  const venues = data?.myVenues || []

  // Calculate stats
  const totalBookings = venues.reduce((acc, venue) => acc + venue.bookings.length, 0)
  const totalRevenue = venues.reduce(
    (acc, venue) => acc + venue.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
    0,
  )
  const avgPricePerHour = Math.round(
    venues.reduce((acc, venue) => acc + venue.basePricePerHour, 0) / venues.length || 0,
  )

  // Calculate pending bookings
  const pendingBookings = venues.reduce(
    (acc, venue) => acc + venue.bookings.filter((booking) => booking.bookingStatus === "PENDING").length,
    0,
  )

  // Get recent bookings across all venues
  const recentBookings = venues
    .flatMap((venue) =>
      venue.bookings.map((booking) => ({
        id: booking.id,
        venue: venue.name,
        user: booking.user.name,
        date: booking.date,
        time: `${booking.timeslots[0].start} - ${booking.timeslots[0].end}`,
        status: booking.bookingStatus,
        amount: `Rs. ${booking.totalPrice}`,
      })),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border border-rose-200"
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200"
    }
  }

  const hasAvailableSlots = (venue) => {
    const today = new Date()
    return venue.bookings.some((booking) => new Date(booking.date) >= today)
  }

  // Colors for charts
  const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"]
  const STATUS_COLORS = {
    APPROVED: "#10b981",
    PENDING: "#f59e0b",
    REJECTED: "#ef4444",
    CANCELLED: "#6b7280",
    COMPLETED: "#3b82f6",
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-purple-100 shadow-md rounded-lg">
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50">
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900 bg-opacity-50 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-4 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">VenueGo</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="/Dashboard" className="flex items-center p-2 rounded-lg text-slate-900 bg-purple-50">
                  <LayoutDashboard className="h-5 w-5 mr-3 text-purple-600" />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/Dashboard/my-venues"
                  className="flex items-center p-2 rounded-lg text-slate-600 hover:bg-purple-50 transition-colors duration-300"
                >
                  <Building className="h-5 w-5 mr-3 text-purple-600" />
                  My Venues
                </a>
              </li>
              <li>
                <a
                  href="/Dashboard/bookings"
                  className="flex items-center p-2 rounded-lg text-slate-600 hover:bg-purple-50 transition-colors duration-300"
                >
                  <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                  Bookings
                </a>
              </li>
              <li>
                <a
                  href="/Dashboard/settings"
                  className="flex items-center p-2 rounded-lg text-slate-600 hover:bg-purple-50 transition-colors duration-300"
                >
                  <Settings className="h-5 w-5 mr-3 text-purple-600" />
                  Settings
                </a>
              </li>
              <li className="pt-4 mt-4 border-t border-purple-100">
                <a
                  href="/logout"
                  className="flex items-center p-2 rounded-lg text-slate-600 hover:bg-purple-50 transition-colors duration-300"
                >
                  <LogOut className="h-5 w-5 mr-3 text-purple-600" />
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-2">
                  <Menu className="h-6 w-6 text-purple-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Vendor Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-1 rounded-full text-purple-600 hover:text-purple-700 transition-colors duration-300 focus:outline-none">
                    <span className="sr-only">Notifications</span>
                    <div className="relative">
                      <Calendar className="h-6 w-6" />
                      {pendingBookings > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {pendingBookings}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className="text-sm font-medium text-slate-700">Vendor Account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Dashboard Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
                  <p className="mt-1 text-sm text-slate-600">Here's what's happening with your venues today.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button
                    onClick={() => navigate("/Dashboard/my-venues/add")}
                    className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Venue
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-600 truncate">Active Venues</dt>
                        <dd className="text-2xl font-semibold text-slate-900">{venues.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-4 py-2">
                  <div className="text-xs">
                    <a
                      href="/Dashboard/my-venues"
                      className="font-medium text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                    >
                      View all venues
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-600 truncate">Total Bookings</dt>
                        <dd className="text-2xl font-semibold text-slate-900">{totalBookings}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-4 py-2">
                  <div className="text-xs">
                    <a
                      href="/Dashboard/bookings"
                      className="font-medium text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                    >
                      Manage bookings
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-600 truncate">Total Revenue</dt>
                        <dd className="text-2xl font-semibold text-slate-900">Rs. {totalRevenue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-4 py-2">
                  <div className="text-xs">
                    <a
                      href="#"
                      className="font-medium text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                    >
                      View earnings
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-600 truncate">Avg. Price/hr</dt>
                        <dd className="text-2xl font-semibold text-slate-900">Rs. {avgPricePerHour}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-4 py-2">
                  <div className="text-xs">
                    <a
                      href="#"
                      className="font-medium text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                    >
                      Price analysis
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-slate-900">Analytics Overview</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600">Time Range:</span>
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none bg-white border border-purple-200 rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  >
                    <option value="1m">Last Month</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-purple-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Revenue Trend */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Revenue Trend</h3>
                    <p className="text-xs text-slate-600">Monthly revenue over time</p>
                  </div>
                  <button className="p-1 text-purple-600 hover:text-purple-700 transition-colors duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (Rs.)"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Booking Status */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Booking Status</h3>
                    <p className="text-xs text-slate-600">Distribution of booking statuses</p>
                  </div>
                  <button className="p-1 text-purple-600 hover:text-purple-700 transition-colors duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-64 flex items-center justify-center">
                  {bookingStatusData.length === 0 ? (
                    <p className="text-slate-600 text-xs">No booking data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Venue Popularity */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Venue Popularity</h3>
                    <p className="text-xs text-slate-600">Number of bookings by venue</p>
                  </div>
                  <button className="p-1 text-purple-600 hover:text-purple-700 transition-colors duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-64">
                  {venuePopularityData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-600 text-xs">No venue data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={venuePopularityData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="bookings" name="Bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Service Offerings */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Service Offerings</h3>
                    <p className="text-xs text-slate-600">Distribution of services across venues</p>
                  </div>
                  <button className="p-1 text-purple-600 hover:text-purple-700 transition-colors duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-64">
                  {serviceUsageData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-600 text-xs">No service data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={serviceUsageData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Number of Venues"
                          fill="#8b5cf6"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Bookings */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="px-4 py-3 border-b border-purple-100 flex justify-between items-center">
                  <h3 className="font-medium text-slate-900 text-sm">Recent Bookings</h3>
                  <a
                    href="/Dashboard/bookings"
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                  >
                    View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </a>
                </div>
                <div>
                  {recentBookings.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-600 text-sm">No bookings yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-purple-100">
                      {recentBookings.map((booking) => (
                        <li key={booking.id} className="px-4 py-3 hover:bg-purple-50 transition-colors duration-300">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-900 truncate">{booking.venue}</div>
                            <div className="ml-2 flex-shrink-0 flex items-center">
                              <span className="text-xs text-slate-600 mr-2">{booking.amount}</span>
                              <span
                                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-md ${getStatusStyle(
                                  booking.status,
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-xs text-slate-600">
                                <Users className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-purple-600" aria-hidden="true" />
                                {booking.user}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-slate-600 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-purple-600" aria-hidden="true" />
                              <p>
                                {booking.date} • {booking.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* My Venues */}
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="px-4 py-3 border-b border-purple-100 flex justify-between items-center">
                  <h3 className="font-medium text-slate-900 text-sm">My Venues</h3>
                  <a
                    href="/Dashboard/my-venues"
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center transition-colors duration-300"
                  >
                    View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </a>
                </div>
                <div>
                  {venues.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-600 text-sm">No venues added yet</p>
                      <button
                        onClick={() => navigate("/Dashboard/my-venues/add")}
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Venue
                      </button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-purple-100">
                      {venues.slice(0, 5).map((venue) => (
                        <li
                          key={venue.id}
                          className="px-4 py-3 hover:bg-purple-50 transition-colors duration-300 cursor-pointer"
                          onClick={() => navigate(`/Dashboard/my-venues/${venue.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-900 truncate">{venue.name}</div>
                            <div className="ml-2 flex-shrink-0">
                              <span className="text-xs text-slate-600">Rs. {venue.basePricePerHour}/hr</span>
                            </div>
                          </div>
                          <div className="mt-1.5 flex justify-between items-center">
                            <p className="flex items-center text-xs text-slate-600">
                              <MapPin className="flex-shrink-0 mr-1 h-3 w-3 text-purple-600" aria-hidden="true" />
                              {venue.location.city}, {venue.location.province}
                            </p>
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${hasAvailableSlots(venue)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                            >
                              {hasAvailableSlots(venue) ? "Active" : "No Bookings"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default VendorDashboard
