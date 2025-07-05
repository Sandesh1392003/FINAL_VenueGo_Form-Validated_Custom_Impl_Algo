"use client"

import { useContext, useState } from "react"
import { Heart, Star, Users, Clock, MapPin, Music, Utensils, Camera, Coffee, Gift, Sun, Video, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl"

function VenueCard({ id, name, image, location, basePricePerHour, capacity, services = [], reviews = [] }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)

  const locationText = location ? `${location.street}, ${location.city}` : "Location not available"

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "New"

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes("dj") || name.includes("music")) return <Music className="w-4 h-4" />
    if (name.includes("catering") || name.includes("food")) return <Utensils className="w-4 h-4" />
    if (name.includes("photo")) return <Camera className="w-4 h-4" />
    if (name.includes("video")) return <Video className="w-4 h-4" />
    if (name.includes("decor")) return <Sparkles className="w-4 h-4" />
    if (name.includes("drinks") || name.includes("beverage")) return <Coffee className="w-4 h-4" />
    if (name.includes("gift")) return <Gift className="w-4 h-4" />
    return <Sun className="w-4 h-4" />
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log(`Venue ${id} ${isFavorite ? "removed from" : "added to"} favorites`)
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/venue/${id}`)}
    >
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-${isHovered ? '70' : '50'} transition-opacity`}></div>
        <img
          src={getOptimizedCloudinaryUrl(image) || "/api/placeholder/400/250"}
          alt={name}
          className={`w-full h-56 object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />

        <div className="absolute bottom-0 left-0 p-4 z-20 text-white">
          <div className="flex items-center">
            <div className="flex items-center bg-indigo-600 rounded-full px-2 py-1 mr-2">
              <Star className="w-3 h-3 text-yellow-300 mr-1" />
              <span className="text-xs font-bold">{averageRating}</span>
            </div>
            <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <Users className="w-3 h-3 mr-1" />
              <span className="text-xs">{capacity} guests</span>
            </div>
          </div>
        </div>

      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold mb-1 text-gray-800">{name}</h3>

        <div className="flex items-center text-gray-500 mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1 text-indigo-500" />
          <p>{locationText}</p>
        </div>

        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-indigo-500" />
              <span className="text-gray-500 text-sm">From</span>
              <span className="font-bold text-lg text-indigo-600 ml-1">Rs. {basePricePerHour}</span>
              <span className="text-gray-500 text-sm ml-1">/hr</span>
            </div>
          </div>
        </div>

        {services?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {services.slice(0, 3).map((service, index) => {
              const ServiceIcon = () => getServiceIcon(service.serviceId.name);

              return (
                <div
                  key={index}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 group"
                >
                  <div className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200">
                    <ServiceIcon />
                  </div>
                  {service.serviceId.name}
                </div>
              );
            })}

            {services.length > 3 && (
              <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                +{services.length - 3}
              </div>
            )}
          </div>
        )}

        <button
          className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center w-full justify-center py-2 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          View Details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default VenueCard