"use client"

import {
  Star,
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  IndianRupee,
  Music,
  Utensils,
  Camera,
  Sparkles,
  ArrowLeft,
  Calendar,
  Shield,
  Award,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react"
import { useQuery } from "@apollo/client"
import { VENUE_BY_ID } from "../../components/Graphql/query/venuesGql"
import Loader from "./Loader"
import { useNavigate, useParams } from "react-router-dom"
import { useContext, useState } from "react"
import { AuthContext } from "../../middleware/AuthContext"
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl"

const VenueDetailsPage = () => {
  const { id } = useParams()
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
  })

  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

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

  const averageRating =
    venue.reviews.length > 0
      ? (venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
      : 0

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes("dj") || name.includes("music")) return <Music className="w-5 h-5" />
    if (name.includes("catering") || name.includes("food")) return <Utensils className="w-5 h-5" />
    if (name.includes("photo") || name.includes("video")) return <Camera className="w-5 h-5" />
    return <Sparkles className="w-5 h-5" />
  }

  // Format category name for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleNavigate = (id) => {
    localStorage.setItem("searchedVenueId", id)
    navigate(isAuthenticated ? `/Home/venue/${id}/book-now` : "/login")
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: `Check out this amazing venue: ${venue.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const displayedReviews = showAllReviews ? venue.reviews : venue.reviews.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-xl transition-all duration-300 ${isFavorited
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-600"
                  }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-600 transition-all duration-300"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img
                src={getOptimizedCloudinaryUrl(venue.image?.secure_url) || "/placeholder.svg?height=400&width=600"}
                alt={venue.name}
                className="w-full h-80 lg:h-full object-cover"
              />
              {venue.approvalStatus === "APPROVED" && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Verified
                </div>
              )}
              {averageRating >= 4.5 && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Top Rated
                </div>
              )}
            </div>

            {/* Venue Info */}
            <div className="p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4">{venue.name}</h1>
                  <div className="flex items-center gap-4 text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span>
                        {venue.location.street}, {venue.location.city}, {venue.location.province}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Up to {venue.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Hourly booking</span>
                    </div>
                  </div>

                  {averageRating > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-bold text-lg text-slate-900">{averageRating}</span>
                      </div>
                      <span className="text-slate-600">({venue.reviews.length} reviews)</span>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-700 flex items-center">
                          Rs.
                          {venue.basePricePerHour}
                        </div>
                        <div className="text-slate-600">per hour</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Starting from</div>
                        <div className="text-sm text-purple-600 font-medium">Additional services available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleNavigate(venue.id)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </button>
                <button className="px-6 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Venue</h2>
          <p className="text-slate-700 leading-relaxed text-lg">{venue.description}</p>
        </div>

        {/* Event Types */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Perfect For</h2>
          {venue.categories && venue.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {venue.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors duration-300"
                >
                  {formatCategory(category)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">Suitable for all types of events</p>
          )}
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Services</h2>
          {venue.services && venue.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venue.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-6 border border-slate-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {service.serviceId.image?.secure_url ? (
                        <img
                          src={
                            getOptimizedCloudinaryUrl(service.serviceId.image.secure_url) ||
                            "/placeholder.svg?height=60&width=60"
                          }
                          alt={service.serviceId.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                          {getServiceIcon(service.serviceId.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{service.serviceId.name}</h3>
                      <div className="flex items-center text-purple-600 font-bold">
                        <IndianRupee className="w-4 h-4" />
                        <span>{service.servicePrice}</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {service.category === "hourly" ? "Per hour" : "Fixed price"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">No additional services listed</div>
              <div className="text-sm text-slate-500">Contact the venue owner for custom service options</div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
            {venue.reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
              >
                {showAllReviews ? "Show Less" : `View All ${venue.reviews.length} Reviews`}
              </button>
            )}
          </div>

          {venue.reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">No reviews yet</div>
              <div className="text-sm text-slate-500">Be the first to review this venue!</div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedReviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">{review?.user?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-slate-900">{review?.user?.name || "Anonymous"}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Venue Owner */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Venue Owner</h2>
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">{venue.owner.name?.charAt(0) || "O"}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">{venue.owner.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span>{venue.owner.email}</span>
                </div>
                {venue.owner.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <span>{venue.owner.phone}</span>
                  </div>
                )}
                {venue.owner.verified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Owner</span>
                  </div>
                )}
              </div>
            </div>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueDetailsPage
