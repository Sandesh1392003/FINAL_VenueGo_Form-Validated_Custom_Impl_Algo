"use client"

import { useContext, useEffect, useRef, useState } from "react"

import {
  Star,
  X,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react"

import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import { useMutation } from "@apollo/client"
import toast from "react-hot-toast"
import { CREATE_REVIEW } from "../Graphql/mutations/ReviewGql"
import { useNavigate } from "react-router-dom"

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-emerald-100"
    case "PENDING":
      return "text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100"
    case "REFUNDED":
      return "text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100"
    default:
      return "text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-slate-100"
  }
}

const getBookingStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-emerald-100"
    case "PENDING":
      return "text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100"
    case "REJECTED":
      return "text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100"
    case "CANCELLED":
      return "text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-slate-100"
    default:
      return "text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-slate-100"
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case "APPROVED":
    case "PAID":
      return <CheckCircle className="w-3 h-3" />
    case "PENDING":
      return <RefreshCw className="w-3 h-3" />
    case "REJECTED":
    case "FAILED":
      return <AlertCircle className="w-3 h-3" />
    default:
      return <Clock className="w-3 h-3" />
  }
}

export default function MyBookingsPage() {
  const { user, loading } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const commentRef = useRef(null)
  const navigate = useNavigate()

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  })

  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW)

  useEffect(() => {
    if (user?.bookings) {
      // Sort bookings by date in descending order (latest first)
      const sortedBookings = [...user.bookings].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA // Latest bookings first
      })
      setBookings(sortedBookings)
    }
  }, [user])

  const handleGenerateReport = (bookingID) => {
    // Navigate to booking report page with booking data
    // You can pass the booking data through state or URL params
    navigate(`/booking-report/${bookingID}`)
  }

  if (loading) return <Loader />

  const handleReviewClick = (venue) => {
    setSelectedVenue(venue)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      await toast.promise(
        createReview({
          variables: {
            input: {
              venue: selectedVenue.id,
              rating: Number.parseInt(reviewForm.rating),
              comment: reviewForm.comment,
            },
          },
        }),
        {
          loading: "Submitting review...",
          success: "Review submitted successfully!",
          error: "Failed to submit review",
        },
      )
      setIsReviewModalOpen(false)
      setReviewForm({ rating: 0, comment: "" })
      setSelectedVenue(null)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours < 12 ? "AM" : "PM"
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const ReviewModal = () => (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/60 backdrop-blur-md">
      <div className="relative group">
        {/* Magical Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-500 scale-100 border border-white/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-2xl">
                  <Star className="text-white" size={20} />
                </div>
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
                Leave a Review
              </h3>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="group p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-110"
            >
              <X className="h-5 w-5 transition-transform duration-300" />
            </button>
          </div>

          {selectedVenue && (
            <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl border border-purple-200/50 shadow-lg">
              <h4 className="font-bold text-slate-900">{selectedVenue.name}</h4>
              <div className="flex items-center text-slate-600 text-sm mt-2">
                <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                <span>
                  {selectedVenue.location?.city}, {selectedVenue.location?.province}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Rating</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none transition-all duration-300 transform hover:scale-125 group"
                  >
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${star <= reviewForm.rating ? "bg-yellow-400/50" : "bg-transparent"
                          }`}
                      ></div>
                      <Star
                        className={`relative h-8 w-8 transition-all duration-300 ${star <= reviewForm.rating
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                            : "text-slate-300 hover:text-yellow-200 group-hover:scale-110"
                          }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-bold text-slate-900 mb-3">
                Comment
              </label>
              <div className="relative">
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/80 border-2 border-purple-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none shadow-lg hover:shadow-xl backdrop-blur-sm"
                  ref={commentRef}
                  defaultValue={reviewForm.comment}
                  onBlur={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your amazing experience..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-3 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewLoading}
                className="group relative overflow-hidden px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                  {reviewLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-violet-400/15 to-purple-400/15 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Spectacular Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 backdrop-blur-sm border border-purple-200/30 rounded-full px-6 py-3 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-bold text-sm tracking-wide">MY BOOKINGS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            My Bookings
          </h1>
          <p className="text-slate-600 font-medium">Manage and review your venue bookings</p>
        </div>

        {/* Bookings */}
        {bookings.length === 0 ? (
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl p-12 text-center group-hover:shadow-3xl transition-all duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-20"></div>
                <Calendar className="relative w-16 h-16 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">No bookings yet</h3>
              <p className="text-slate-600 mb-8 text-lg">Start exploring venues to make your first booking</p>
              <button
                onClick={() => navigate("/venues")}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Browse Venues
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
              {/* Spectacular Table Header */}
              <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-indigo-600/10 backdrop-blur-xl px-8 py-6 border-b border-purple-200/30">
                <div className="grid grid-cols-12 gap-6 text-sm font-black text-slate-900">
                  <div className="col-span-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Venue
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Date & Time
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    Amount
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Status
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Actions
                  </div>
                </div>
              </div>

              {/* Enhanced Table Body */}
              <div className="divide-y divide-purple-100/50">
                {bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="px-8 py-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
                  >
                    <div className="grid grid-cols-12 gap-6 items-center">
                      {/* Enhanced Venue Info */}
                      <div className="col-span-3">
                        <h3
                          className="font-bold text-slate-900 cursor-pointer hover:text-purple-600 transition-all duration-300 group-hover:scale-105 transform"
                          onClick={() => navigate(`/venue/${booking.venue.id}`)}
                        >
                          {booking.venue.name}
                        </h3>
                        <div className="flex items-center text-slate-500 text-sm mt-2">
                          <MapPin className="w-3 h-3 mr-2 text-purple-600" />
                          <span>
                            {booking.venue.location?.city}, {booking.venue.location?.province}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Date & Time */}
                      <div className="col-span-2">
                        <div className="flex items-center text-slate-700 font-semibold mb-2">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="text-sm text-slate-500 space-y-1">
                          {booking.timeslots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Amount */}
                      <div className="col-span-2">
                        <div className="flex items-center text-slate-700">
                          <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="font-black text-lg bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
                            Rs. {booking.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Spectacular Status */}
                      <div className="col-span-2 space-y-2">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg transition-all duration-300 hover:scale-105 ${getBookingStatusColor(
                            booking.bookingStatus,
                          )}`}
                        >
                          {getStatusIcon(booking.bookingStatus)}
                          <span className="ml-2">{booking.bookingStatus}</span>
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg transition-all duration-300 hover:scale-105 ${getPaymentStatusColor(
                            booking.paymentStatus,
                          )}`}
                        >
                          {getStatusIcon(booking.paymentStatus)}
                          <span className="ml-2">{booking.paymentStatus}</span>
                        </span>
                      </div>

                      {/* Amazing Actions */}
                      <div className="col-span-3 flex items-center gap-3">
                        <button
                          onClick={() => handleGenerateReport(booking.id)}
                          className="group p-3 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title="View Venue"
                        >
                          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </button>

                        {booking.bookingStatus === "APPROVED" && booking.paymentStatus === "PAID" && (
                          <button
                            onClick={() => handleReviewClick(booking.venue)}
                            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <div className="relative flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Review
                            </div>
                          </button>
                        )}

                        {booking.bookingStatus === "PENDING" && (
                          <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-200 shadow-lg">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Pending
                          </span>
                        )}

                        {booking.bookingStatus === "REJECTED" && (
                          <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-xl text-sm font-bold border border-red-200 shadow-lg">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Review Modal */}
        {isReviewModalOpen && <ReviewModal />}
      </div>
    </div>
  )
}
