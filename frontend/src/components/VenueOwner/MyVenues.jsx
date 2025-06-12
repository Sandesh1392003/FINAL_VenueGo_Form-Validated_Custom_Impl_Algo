"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  Users,
  Clock,
  Star,
  Trash2,
  Plus,
  AlertCircle,
  Loader,
  Pencil,
  Search,
  Filter,
  ChevronDown,
  BookOpen,
  DollarSign,
  MoreHorizontal,
  Building,
  X,
  Grid,
  List,
} from "lucide-react"
import AnotherLoader from "../../pages/common/AnotherLoader"
import { useMutation, useQuery } from "@apollo/client"
import { REMOVE_VENUE } from "../Graphql/mutations/VenueGql"
import { toast } from "react-hot-toast"
import { useDeleteImage } from "../Functions/deleteImage"
import { MY_VENUES } from "../Graphql/query/meGql"

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dduky37gb/image/upload/v1740127136/VenueGo/venues/svbbysrakec9salwl8ex.png" // Fallback image

export default function MyVenues() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [showFilters, setShowFilters] = useState(false)
  const [removeVenue] = useMutation(REMOVE_VENUE)
  const { deleteImage } = useDeleteImage()
  const { data, loading } = useQuery(MY_VENUES)

  useEffect(() => {
    if (data?.myVenues) {
      setVenues(data.myVenues || []) // Ensure it's an array
      setFilteredVenues(data.myVenues || [])
      setIsDataLoading(false)
    }
  }, [data])

  // Get unique categories from venues
  const categories =
    (venues || []).length > 0
      ? [...new Set(venues.flatMap((venue) => venue.categories || []))].filter(Boolean).sort()
      : []

  // Filter and sort venues when search, filter, or sort criteria change
  useEffect(() => {
    if (venues.length > 0) {
      let result = [...venues]

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (venue) =>
            venue.name.toLowerCase().includes(term) ||
            venue.description?.toLowerCase().includes(term) ||
            venue.location?.city?.toLowerCase().includes(term),
        )
      }

      // Apply category filter
      if (filterCategory) {
        result = result.filter((venue) => venue.categories && venue.categories.includes(filterCategory))
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name)
          case "price":
            return a.basePricePerHour - b.basePricePerHour
          case "bookings":
            return b.bookings.length - a.bookings.length
          case "rating":
            return calculateAverageRatingValue(b.reviews) - calculateAverageRatingValue(a.reviews)
          default:
            return 0
        }
      })

      setFilteredVenues(result)
    }
  }, [venues, searchTerm, filterCategory, sortBy])

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "No ratings"
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    return average.toFixed(1)
  }

  const calculateAverageRatingValue = (reviews = []) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const formatCategory = (category) => {
    if (!category) return "Uncategorized"
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleDeleteClick = (id, e) => {
    e.stopPropagation()
    setVenueToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteVenue = async () => {
    setIsLoading(true)
    try {
      // Remove venue via API
      const response = await removeVenue({
        variables: { venueId: venueToDelete },
      })

      const { success, message } = response.data?.removeVenue
      if (success) {
        toast.success(message)

        // Find the venue to delete and extract public_id
        const venue = venues.find((v) => v.id == venueToDelete)
        const publicId = venue?.image?.public_id

        if (publicId) {
          try {
            await deleteImage(publicId)
          } catch (error) {
            console.error("Failed to delete image:", error)
          }
        }
      } else {
        toast.error("Failed to remove venue")
      }

      // Small delay for UI smoothness
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update state
      setVenues((prevVenues) => prevVenues.filter((venue) => venue.id !== venueToDelete))
      setShowDeleteDialog(false)
    } catch (err) {
      console.error(err)
      setError("Failed to delete venue. Please try again.")
    } finally {
      setIsLoading(false)
      setVenueToDelete(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterCategory("")
    setSortBy("name")
  }

  const hasActiveFilters = () => {
    return searchTerm || filterCategory || sortBy !== "name"
  }

  const navigateToVenue = (id) => {
    navigate(`/Dashboard/my-venues/${id}`)
  }

  if (loading || isDataLoading) return <AnotherLoader />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your venues and their availability</p>
          </div>
          <button
            onClick={() => navigate("/Dashboard/add-venue")}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Venue
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-50">
                  <Building className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Venues</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{venues.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-50">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {venues.reduce((sum, venue) => sum + venue.bookings.length, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-amber-50">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Price/Hour</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      Rs.{" "}
                      {venues.length > 0
                        ? Math.round(venues.reduce((sum, venue) => sum + venue.basePricePerHour, 0) / venues.length)
                        : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-rose-50">
                  <Star className="h-6 w-6 text-rose-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Rating</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {venues.length > 0 && venues.some((venue) => venue.reviews?.length > 0)
                        ? (
                          venues.reduce((sum, venue) => {
                            const rating = calculateAverageRatingValue(venue.reviews)
                            return sum + (rating || 0)
                          }, 0) / venues.filter((venue) => venue.reviews?.length > 0).length
                        ).toFixed(1)
                        : "—"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search venues by name, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border ${hasActiveFilters() || showFilters ? "bg-gray-100 border-gray-300" : "border-gray-200 hover:bg-gray-50"
                  } rounded-lg transition-colors`}
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <span className="flex items-center justify-center bg-gray-900 text-white rounded-full w-5 h-5 text-xs">
                    {(searchTerm ? 1 : 0) + (filterCategory ? 1 : 0) + (sortBy !== "name" ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="appearance-none w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {formatCategory(category)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="bookings">Most Bookings</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {hasActiveFilters() && (
                  <div className="self-end mt-auto">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {filteredVenues.length === 0
              ? "No venues found"
              : `Showing ${filteredVenues.length} of ${venues.length} venues`}
          </div>
        </div>

        {venues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                <Building className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first venue to begin managing your spaces.
              </p>
              <button
                onClick={() => navigate("/Dashboard/add-venue")}
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Venue
              </button>
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No venues match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria or clear all filters.</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToVenue(venue.id)}
              >
                <div className="relative">
                  <img
                    src={venue.image?.secure_url || PLACEHOLDER_IMAGE}
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                  />
                  {venue.categories && venue.categories.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-black bg-opacity-60 text-white text-xs font-medium rounded-md">
                        {formatCategory(venue.categories[0])}
                      </span>
                      {venue.categories.length > 1 && (
                        <span className="px-2 py-1 bg-black bg-opacity-60 text-white text-xs font-medium rounded-md">
                          +{venue.categories.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center bg-white bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium">
                      <Star className="h-3.5 w-3.5 text-amber-500 mr-1" />
                      {calculateAverageRating(venue.reviews)}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{venue.name}</h3>
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle dropdown
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{venue.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="truncate">
                        {venue.location.city}, {venue.location.province}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Rs. {venue.basePricePerHour}/hour</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">{venue.bookings.length}</span> bookings
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => navigate(`/Dashboard/edit-venue/${venue.id}`, { state: { from: "my-venues" } })}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                        aria-label="Edit venue"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(venue.id, e)}
                        disabled={isLoading}
                        className="p-1.5 bg-rose-100 text-rose-600 rounded-md hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete venue"
                      >
                        {isLoading && venueToDelete === venue.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Hour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVenues.map((venue) => (
                    <tr
                      key={venue.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToVenue(venue.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={venue.image?.secure_url || PLACEHOLDER_IMAGE}
                              alt={venue.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                            {venue.categories && venue.categories.length > 0 && (
                              <div className="text-xs text-gray-500">{formatCategory(venue.categories[0])}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {venue.location.city}, {venue.location.province}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{venue.capacity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {venue.basePricePerHour}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{venue.bookings.length}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm text-gray-500">{calculateAverageRating(venue.reviews)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/Dashboard/edit-venue/${venue.id}`)
                            }}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                            aria-label="Edit venue"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(venue.id, e)}
                            disabled={isLoading}
                            className="p-1.5 bg-rose-100 text-rose-600 rounded-md hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete venue"
                          >
                            {isLoading && venueToDelete === venue.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
              <div className="mb-5 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Venue</h3>
              <p className="text-gray-500 text-center mb-6">
                This action cannot be undone. This will permanently delete your venue and remove all associated data
                from our servers.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVenue}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>Delete Venue</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
