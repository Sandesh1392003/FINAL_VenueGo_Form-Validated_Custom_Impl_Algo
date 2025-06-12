"use client"

import { useState, useEffect, useContext, useMemo } from "react"
import {
  Clock,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  Check,
  Package,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  CreditCard,
  Shield,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { VENUE_BY_ID } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../middleware/AuthContext"
import EsewaPaymentForm from "./EsewaPaymentForm"
import { calculateTotalPrice } from "./Functions/calc"
import getOptimizedCloudinaryUrl from "../components/Functions/OptimizedImageUrl"

// Calendar component for date selection with availability indicators
const DatePicker = ({ availableDates, selectedDate, onDateChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get days in month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  // Format date as YYYY-MM-DD for comparison
  const formatDateString = (date) => {
    return date.toISOString().split("T")[0]
  }

  // Check if a date is available
  const isDateAvailable = (date) => {
    const dateString = formatDateString(date)
    return availableDates.includes(dateString)
  }

  // Check if a date is in the past
  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Check if a date is selected
  const isDateSelected = (date) => {
    return selectedDate === formatDateString(date)
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Get month name and year
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  // Days of week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDateString(date)
    const isPast = isDateInPast(date)
    const isAvailable = isDateAvailable(date)
    const isSelected = isDateSelected(date)

    calendarDays.push(
      <button
        key={dateString}
        onClick={() => !isPast && isAvailable && onDateChange(dateString)}
        disabled={isPast || !isAvailable}
        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
          ${isPast ? "text-slate-300 cursor-not-allowed" : ""}
          ${isSelected ? "bg-purple-600 text-white shadow-md" : ""}
          ${!isPast && isAvailable && !isSelected ? "hover:bg-purple-100 hover:text-purple-700" : ""}
          ${!isPast && !isAvailable ? "text-slate-400 cursor-not-allowed" : ""}
        `}
      >
        {day}
      </button>,
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-purple-100 hover:text-purple-700 transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {monthName} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-purple-100 hover:text-purple-700 transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-slate-500">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-slate-300 mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}

// Add a helper function to convert time string to minutes for easier comparison
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

// Helper function to format time for display (e.g., 09:00 AM/PM)
const formatTimeForDisplay = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  const period = hours < 12 ? "AM" : "PM"
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12 // Convert 0 and 12 to 12
  return `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Time slot selector component
const TimeSlotSelector = ({
  availableTimeSlots,
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  bookings = [],
  bookingDetails,
}) => {
  // Convert selected start time to minutes
  const startTimeMinutes = selectedStartTime ? timeToMinutes(selectedStartTime) : 0

  // Filter end time options based on selected start time
  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return []

    const startTimeIndex = availableTimeSlots.findIndex((slot) => slot === selectedStartTime)
    if (startTimeIndex === -1) return []

    // Get the current date's bookings
    const dateBookings = bookings.filter((booking) => booking.date === bookingDetails.date)

    // Only show end times that are after the selected start time
    // AND don't overlap with any existing bookings
    return availableTimeSlots.filter((timeSlot, index) => {
      // Must be after start time
      if (index <= startTimeIndex) return false

      const endTimeMinutes = timeToMinutes(timeSlot)

      // Check if this potential end time would overlap with any booking
      for (const booking of dateBookings) {
        for (const slot of booking.timeslots) {
          const bookingStartMinutes = timeToMinutes(slot.start)
          const bookingEndMinutes = timeToMinutes(slot.end)

          // If our start time is before booking start, and this end time is after booking start,
          // then it would overlap
          if (startTimeMinutes < bookingStartMinutes && endTimeMinutes > bookingStartMinutes) {
            return false
          }

          // If our start time is within a booking, this is already invalid
          if (startTimeMinutes >= bookingStartMinutes && startTimeMinutes < bookingEndMinutes) {
            return false
          }
        }
      }

      return true
    })
  }, [availableTimeSlots, selectedStartTime, bookingDetails.date, bookings])

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-2">
          Start Time
        </label>
        <div className="relative">
          <select
            id="startTime"
            value={selectedStartTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="appearance-none pl-12 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            disabled={availableTimeSlots.length === 0}
          >
            <option value="">Select start time</option>
            {availableTimeSlots.map((time) => (
              <option key={`start-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <div className="absolute left-4 top-3 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-2">
          End Time
        </label>
        <div className="relative">
          <select
            id="endTime"
            value={selectedEndTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="appearance-none pl-12 pr-4 py-3 w-full border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            disabled={!selectedStartTime || availableEndTimes.length === 0}
          >
            <option value="">Select end time</option>
            {availableEndTimes.map((time) => (
              <option key={`end-${time}`} value={time}>
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
          <div className="absolute left-4 top-3 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Add information about the 1-hour gap policy */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          A 1-hour gap is automatically reserved between bookings for venue preparation and cleanup.
        </p>
      </div>
    </div>
  )
}

// Helper function to generate time slots for a day (24-hour format)
const generateTimeSlots = () => {
  const slots = []
  // Generate slots from 00:00 to 23:00 in hourly increments
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
  }
  return slots
}

// Helper function to check if a time is within a booking's time range (including 1-hour buffer)
const isTimeConflicting = (time, bookings, date) => {
  // Convert time string to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const timeInMinutes = timeToMinutes(time)

  // Check each booking for the selected date
  for (const booking of bookings) {
    if (booking.date === date) {
      for (const timeslot of booking.timeslots) {
        // Convert booking times to minutes
        const startInMinutes = timeToMinutes(timeslot.start)
        const endInMinutes = timeToMinutes(timeslot.end)

        // Add 1-hour buffer (60 minutes) before and after booking
        const bufferStartInMinutes = Math.max(0, startInMinutes - 60)
        const bufferEndInMinutes = Math.min(24 * 60 - 1, endInMinutes + 60)

        // Check if time falls within the booking time range (including buffer)
        if (timeInMinutes >= bufferStartInMinutes && timeInMinutes < bufferEndInMinutes) {
          return true // Time conflicts with a booking
        }
      }
    }
  }

  return false // No conflict found
}

// Service card component
const ServiceCard = ({ service, isSelected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 ${isSelected ? "border-purple-600 bg-purple-50" : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
        }`}
    >
      <div className="flex-shrink-0">
        {service.serviceId.image?.secure_url ? (
          <img
            src={getOptimizedCloudinaryUrl(service.serviceId.image.secure_url) || "/placeholder.svg?height=60&width=60"}
            alt={service.serviceId.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-slate-900">{service.serviceId.name}</h4>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? "bg-purple-600" : "border-2 border-slate-300"
              }`}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
        <div className="flex items-center mt-1 text-purple-600 font-semibold">
          <IndianRupee className="h-4 w-4 mr-1" />
          {service.servicePrice}
        </div>
        <div className="text-xs text-slate-500 mt-1">{service.category === "hourly" ? "Per hour" : "Fixed price"}</div>
      </div>
    </div>
  )
}

const BookNowPage = () => {
  const { venueId } = useParams() || {}
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      window.location.href = "/login"
    }
  }, [])

  // Fetch venue details (which now includes bookings)
  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id: venueId },
  })

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    startTime: "",
    endTime: "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    selectedServices: [],
  })

  const [errors, setErrors] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [activeStep, setActiveStep] = useState(1) // 1: Date & Time, 2: Review & Pay

  // Process venue data to get available dates and time slots
  const { availableDates, availableTimeSlotsByDate } = useMemo(() => {
    if (!data?.venue) {
      return { availableDates: [], availableTimeSlotsByDate: {} }
    }

    const venue = data.venue
    const bookings = venue.bookings || []
    const allTimeSlots = generateTimeSlots()
    const availableTimeSlotsByDate = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Generate dates for the next 90 days
    const dates = []
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    // Calculate available time slots for each date
    for (const date of dates) {
      const availableSlotsForDate = allTimeSlots.filter((time) => !isTimeConflicting(time, bookings, date))

      // Only include dates that have at least one available time slot
      if (availableSlotsForDate.length > 0) {
        availableTimeSlotsByDate[date] = availableSlotsForDate
      }
    }

    return {
      availableDates: Object.keys(availableTimeSlotsByDate),
      availableTimeSlotsByDate,
    }
  }, [data?.venue])

  // Get available time slots for the selected date
  const availableTimeSlotsForSelectedDate = useMemo(() => {
    if (!bookingDetails.date || !availableTimeSlotsByDate[bookingDetails.date]) {
      return []
    }
    return availableTimeSlotsByDate[bookingDetails.date]
  }, [bookingDetails.date, availableTimeSlotsByDate])

  useEffect(() => {
    // Calculate total price whenever booking details change
    if (data?.venue && bookingDetails.startTime && bookingDetails.endTime) {
      // Calculate venue rental price based on hours
      const basePrice = calculateTotalPrice(
        bookingDetails.startTime,
        bookingDetails.endTime,
        data.venue.basePricePerHour,
      )

      // Add service prices
      const servicePrice = bookingDetails.selectedServices.reduce((total, serviceId) => {
        const service = data.venue.services.find((s) => s.serviceId.id === serviceId)
        if (service) {
          // Use the servicePrice as a fixed price
          return total + service.servicePrice
        }
        return total
      }, 0)

      setTotalPrice(basePrice + servicePrice)
    }
  }, [bookingDetails.startTime, bookingDetails.endTime, bookingDetails.selectedServices, data?.venue])

  // Reset time selections when date changes
  useEffect(() => {
    setBookingDetails((prev) => ({
      ...prev,
      startTime: "",
      endTime: "",
    }))
  }, [bookingDetails.date])

  if (loading) return <Loader />
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">Error loading venue</div>
          <div className="text-slate-600">{error.message}</div>
        </div>
      </div>
    )
  if (!data?.venue)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-900 text-xl font-semibold mb-2">Venue not found</div>
          <div className="text-slate-600">The venue you're looking for doesn't exist.</div>
        </div>
      </div>
    )

  const venue = data.venue

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }))

    // Clear errors when input changes
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }))
  }

  const handleDateChange = (date) => {
    setBookingDetails((prev) => ({
      ...prev,
      date,
      startTime: "",
      endTime: "",
    }))
  }

  const handleStartTimeChange = (time) => {
    setBookingDetails((prev) => ({
      ...prev,
      startTime: time,
      endTime: "",
    }))
  }

  const handleEndTimeChange = (time) => {
    setBookingDetails((prev) => ({
      ...prev,
      endTime: time,
    }))
  }

  const handleServiceToggle = (serviceId) => {
    setBookingDetails((prevDetails) => {
      const selectedServices = [...prevDetails.selectedServices]

      if (selectedServices.includes(serviceId)) {
        return {
          ...prevDetails,
          selectedServices: selectedServices.filter((id) => id !== serviceId),
        }
      } else {
        return {
          ...prevDetails,
          selectedServices: [...selectedServices, serviceId],
        }
      }
    })
  }

  // Calculate duration in hours between start and end time
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0
    const startTime = new Date(`2000-01-01T${start}`)
    const endTime = new Date(`2000-01-01T${end}`)
    return (endTime - startTime) / (1000 * 60 * 60)
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Check if current step is complete
  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return bookingDetails.date && bookingDetails.startTime && bookingDetails.endTime
      case 2:
        return bookingDetails.name && bookingDetails.email && bookingDetails.phone
      default:
        return false
    }
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (isStepComplete(activeStep)) {
      setActiveStep(activeStep + 1)
    }
  }

  // Navigate to previous step
  const goToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Venue</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Book {venue.name}</h1>
          <p className="text-slate-600">Complete your booking in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className={`flex flex-col items-center ${activeStep >= 1 ? "text-purple-600" : "text-slate-400"}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 1 ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${activeStep >= 2 ? "bg-purple-600" : "bg-slate-200"}`}></div>
            <div className={`flex flex-col items-center ${activeStep >= 2 ? "text-purple-600" : "text-slate-400"}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 2 ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Review & Pay</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Date & Time */}
            {activeStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Date & Time</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose a Date</h3>
                    <DatePicker
                      availableDates={availableDates}
                      selectedDate={bookingDetails.date}
                      onDateChange={handleDateChange}
                      minDate={today}
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose a Time</h3>
                    {bookingDetails.date ? (
                      <TimeSlotSelector
                        availableTimeSlots={availableTimeSlotsForSelectedDate}
                        selectedStartTime={bookingDetails.startTime}
                        selectedEndTime={bookingDetails.endTime}
                        onStartTimeChange={handleStartTimeChange}
                        onEndTimeChange={handleEndTimeChange}
                        bookings={data?.venue?.bookings || []}
                        bookingDetails={bookingDetails}
                      />
                    ) : (
                      <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 text-center">
                        <Clock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-600">Please select a date first to see available time slots</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={goToNextStep}
                    disabled={!isStepComplete(1)}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${isStepComplete(1)
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Pay */}
            {activeStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Complete Booking</h2>

                <div className="space-y-8">
                  {/* Customer Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={bookingDetails.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={bookingDetails.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={bookingDetails.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services Selection */}
                  {venue.services && venue.services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Services (Optional)</h3>
                      <div className="space-y-4">
                        {venue.services.map((service) => (
                          <ServiceCard
                            key={service.serviceId.id}
                            service={service}
                            isSelected={bookingDetails.selectedServices.includes(service.serviceId.id)}
                            onToggle={() => handleServiceToggle(service.serviceId.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Summary</h3>
                    <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-6 border border-slate-100">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <span className="text-slate-600">Date:</span>
                          <span className="font-medium text-slate-900">{formatDate(bookingDetails.date)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <span className="text-slate-600">Time:</span>
                          <span className="font-medium text-slate-900">
                            {formatTimeForDisplay(bookingDetails.startTime)} -{" "}
                            {formatTimeForDisplay(bookingDetails.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <span className="text-slate-600">Duration:</span>
                          <span className="font-medium text-slate-900">
                            {calculateDuration(bookingDetails.startTime, bookingDetails.endTime)} hours
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <span className="text-slate-600">Venue Rental:</span>
                          <div className="flex items-center font-medium text-slate-900">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            <span>
                              {calculateTotalPrice(
                                bookingDetails.startTime,
                                bookingDetails.endTime,
                                venue.basePricePerHour,
                              )}
                            </span>
                          </div>
                        </div>

                        {bookingDetails.selectedServices.length > 0 && (
                          <div className="pb-4 border-b border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-slate-600">Additional Services:</span>
                              <span className="text-sm text-purple-600 font-medium">
                                {bookingDetails.selectedServices.length} selected
                              </span>
                            </div>
                            <div className="space-y-2 pl-4">
                              {bookingDetails.selectedServices.map((serviceId) => {
                                const service = venue.services.find((s) => s.serviceId.id === serviceId)
                                if (!service) return null

                                return (
                                  <div key={serviceId} className="flex justify-between text-sm items-center">
                                    <div className="flex items-center">
                                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                                      <span className="text-slate-700">{service.serviceId.name}</span>
                                    </div>
                                    <div className="flex items-center font-medium text-slate-900">
                                      <IndianRupee className="w-3 h-3 mr-1" />
                                      <span>{service.servicePrice}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-semibold text-slate-900">Total Amount:</span>
                          <div className="flex items-center text-xl font-bold text-purple-700">
                            <IndianRupee className="w-5 h-5 mr-1" />
                            <span>{totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment</h3>
                    <div className="bg-white rounded-xl border-2 border-slate-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium text-slate-900">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-6 bg-slate-200 rounded"></div>
                          <div className="w-10 h-6 bg-slate-200 rounded"></div>
                          <div className="w-10 h-6 bg-slate-200 rounded"></div>
                        </div>
                      </div>

                      {/* Esewa Payment Form */}
                      <EsewaPaymentForm
                        venue={venueId}
                        start={bookingDetails.startTime}
                        end={bookingDetails.endTime}
                        date={bookingDetails.date}
                        selectedServices={bookingDetails.selectedServices}
                        totalAmount={totalPrice}
                        disabled={
                          !bookingDetails.date ||
                          !bookingDetails.startTime ||
                          !bookingDetails.endTime ||
                          !bookingDetails.name ||
                          !bookingDetails.email ||
                          !bookingDetails.phone
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={goToPrevStep}
                    className="px-8 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Venue Summary */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <img
                src={getOptimizedCloudinaryUrl(venue.image?.secure_url) || "/placeholder.svg?height=200&width=400"}
                alt={venue.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{venue.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                    <span>
                      {venue.location.street}, {venue.location.city}, {venue.location.province}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    <span>Capacity: {venue.capacity} guests</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-5 h-5 text-purple-600 mr-3" />
                    <span>
                      <IndianRupee className="w-4 h-4 inline-block" /> {venue.basePricePerHour}/hour
                    </span>
                  </div>
                  {venue.reviews && venue.reviews.length > 0 && (
                    <div className="flex items-center text-slate-600">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-3" />
                      <span>
                        {(venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(
                          1,
                        )}{" "}
                        ({venue.reviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Summary (Sticky) */}
            {bookingDetails.startTime && bookingDetails.endTime && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Booking</h3>
                {bookingDetails.date && (
                  <div className="flex items-center mb-3 text-slate-600">
                    <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                    <span>{formatDate(bookingDetails.date)}</span>
                  </div>
                )}
                {bookingDetails.startTime && bookingDetails.endTime && (
                  <div className="flex items-center mb-3 text-slate-600">
                    <Clock className="w-5 h-5 text-purple-600 mr-3" />
                    <span>
                      {formatTimeForDisplay(bookingDetails.startTime)} - {formatTimeForDisplay(bookingDetails.endTime)}
                    </span>
                  </div>
                )}
                {bookingDetails.selectedServices.length > 0 && (
                  <div className="flex items-start mb-3 text-slate-600">
                    <Package className="w-5 h-5 text-purple-600 mr-3 mt-1" />
                    <div>
                      <span className="block mb-1">Services:</span>
                      <div className="pl-2">
                        {bookingDetails.selectedServices.map((serviceId) => {
                          const service = venue.services.find((s) => s.serviceId.id === serviceId)
                          if (!service) return null
                          return (
                            <div key={serviceId} className="flex items-center text-sm">
                              <CheckCircle className="w-3 h-3 text-purple-600 mr-2" />
                              <span>{service.serviceId.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Venue Rental:</span>
                    <div className="flex items-center font-medium">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      <span>
                        {calculateTotalPrice(bookingDetails.startTime, bookingDetails.endTime, venue.basePricePerHour)}
                      </span>
                    </div>
                  </div>
                  {bookingDetails.selectedServices.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Services:</span>
                      <div className="flex items-center font-medium">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        <span>
                          {bookingDetails.selectedServices.reduce((total, serviceId) => {
                            const service = venue.services.find((s) => s.serviceId.id === serviceId)
                            return total + (service ? service.servicePrice : 0)
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <div className="flex items-center font-bold text-purple-700 text-lg">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookNowPage
