"use client"

import { useEffect, useState } from "react"
import { Search, X, Filter, ChevronDown, Star } from "lucide-react"
import VenueCard from "../common/VenueCard"
import { useQuery } from "@apollo/client"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import Loader from "../common/Loader"
import { binarySearchVenues, VenueTrie } from "../../components/Functions/Algo"

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("price")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [filteredVenues, setFilteredVenues] = useState([])
  const [filters, setFilters] = useState({
    capacity: "",
    categories: [],
    province: "",
    services: [],
  })
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [venueTrie, setVenueTrie] = useState(null)

  const { data, error, loading } = useQuery(VENUES)
  const [allServices, setAllServices] = useState([])
  const [allProvinces, setAllProvinces] = useState([])
  const [allCategories, setAllCategories] = useState([])

  useEffect(() => {
    if (data?.venues) {
      // Extract unique services, provinces, and categories
      const services = new Set()
      const provinces = new Set()
      const categories = new Set()

      data.venues.forEach((venue) => {
        // Handle both single category and categories array
        if (Array.isArray(venue.categories) && venue.categories.length > 0) {
          venue.categories.forEach((cat) => categories.add(cat))
        } else if (venue.category) {
          categories.add(venue.category)
        }

        if (venue.location?.province) provinces.add(venue.location.province)
        venue.services?.forEach((service) => {
          if (service.serviceId?.name) services.add(service.serviceId.name)
        })
      })

      setAllServices(Array.from(services).sort())
      setAllProvinces(Array.from(provinces).sort())
      setAllCategories(Array.from(categories).sort())

      // Build Trie for autocompletion (names and cities)
      const trie = new VenueTrie()
      data.venues.forEach((venue) => {
        if (venue.name) trie.insert(venue.name, venue)
        if (venue.location?.city) trie.insert(venue.location.city, venue)
      })
      setVenueTrie(trie)
      applyFiltersAndSort(data.venues)
    }
  }, [data])

  useEffect(() => {
    if (data?.venues) {
      applyFiltersAndSort(data.venues)
    }
  }, [searchTerm, sortBy, filters])

  // Autocomplete suggestions when searchTerm changes
  useEffect(() => {
    if (venueTrie && searchTerm) {
      // Get unique venues for suggestions
      const suggestions = venueTrie.autocomplete(searchTerm)
      // Remove duplicates by id
      const unique = []
      const seen = new Set()
      for (const v of suggestions) {
        if (!seen.has(v.id)) {
          unique.push(v)
          seen.add(v.id)
        }
      }
      setAutocompleteSuggestions(unique.slice(0, 6)) // Limit to 6 suggestions
      setShowSuggestions(true)
    } else {
      setAutocompleteSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, venueTrie])

  const applyFiltersAndSort = (venues) => {
    // Sort venues by name (for binary search)
    const sortedVenues = [...venues].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || ""
      const nameB = b.name?.toLowerCase() || ""
      return nameA.localeCompare(nameB)
    })

    // Use binary search for searchTerm
    let filtered = searchTerm ? binarySearchVenues(sortedVenues, searchTerm) : sortedVenues

    // Apply categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((venue) => {
        // Handle venues with categories array
        if (Array.isArray(venue.categories) && venue.categories.length > 0) {
          return filters.categories.some((category) => venue.categories.includes(category))
        }
        // Handle venues with single category for backward compatibility
        else if (venue.category) {
          return filters.categories.includes(venue.category)
        }
        return false
      })
    }

    // Apply province filter
    if (filters.province) {
      filtered = filtered.filter((venue) => venue.location?.province === filters.province)
    }

    // Apply capacity filter
    if (filters.capacity) {
      filtered = filtered.filter((venue) => venue.capacity >= Number(filters.capacity))
    }

    // Apply services filter
    if (filters.services.length > 0) {
      filtered = filtered.filter((venue) => {
        if (!venue.services || venue.services.length === 0) return false
        return filters.services.every((serviceName) =>
          venue.services.some((service) => service.serviceId?.name === serviceName),
        )
      })
    }

    // Apply sorting
    if (sortBy === "price") {
      filtered.sort((a, b) => a.basePricePerHour - b.basePricePerHour)
    } else if (sortBy === "priceDesc") {
      filtered.sort((a, b) => b.basePricePerHour - a.basePricePerHour)
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews))
    } else if (sortBy === "capacity") {
      filtered.sort((a, b) => b.capacity - a.capacity)
    }

    setFilteredVenues(filtered)
  }

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleServiceFilter = (service) => {
    setFilters((prev) => {
      const services = [...prev.services]
      if (services.includes(service)) {
        return {
          ...prev,
          services: services.filter((s) => s !== service),
        }
      } else {
        return {
          ...prev,
          services: [...services, service],
        }
      }
    })
  }

  const toggleCategoryFilter = (category) => {
    setFilters((prev) => {
      const categories = [...prev.categories]
      if (categories.includes(category)) {
        return {
          ...prev,
          categories: categories.filter((c) => c !== category),
        }
      } else {
        return {
          ...prev,
          categories: [...categories, category],
        }
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      capacity: "",
      categories: [],
      province: "",
      services: [],
    })
    setSearchTerm("")
  }

  const hasActiveFilters = () => {
    return (
      searchTerm || filters.capacity || filters.categories.length > 0 || filters.province || filters.services.length > 0
    )
  }

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getSortDisplayText = () => {
    switch (sortBy) {
      case "price":
        return "Price: Low → High"
      case "priceDesc":
        return "Price: High → Low"
      case "rating":
        return "Rating: High → Low"
      case "capacity":
        return "Capacity: High → Low"
      default:
        return "Price: Low → High"
    }
  }

  if (loading) return <Loader />
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">Find Your Perfect Event Space</h1>
          <p className="text-gray-600">Discover extraordinary venues for unforgettable experiences</p>
        </div>

        {/* Search and Controls Section */}
        <div className="flex items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                placeholder="Search venues by name or city..."
                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  if (autocompleteSuggestions.length > 0) setShowSuggestions(true)
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 100)
                }}
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {autocompleteSuggestions.map((venue) => (
                  <div
                    key={venue.id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    onMouseDown={() => {
                      setSearchTerm(venue.name)
                      setShowSuggestions(false)
                    }}
                  >
                    <span className="font-medium text-gray-900">{venue.name}</span>
                    {venue.location?.city && <span className="text-gray-500 ml-2">({venue.location.city})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer">
              <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              <select
                className="appearance-none bg-transparent border-none outline-none cursor-pointer text-gray-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="rating">Rating: High → Low</option>
                <option value="capacity">Capacity: High → Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Show Filters Button */}
          <button
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Filter className="w-4 h-4" />
            Show Filters
            {hasActiveFilters() && (
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {Object.values(filters).flat().filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {isFilterVisible && (
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Capacity</label>
                  <select
                    name="capacity"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={filters.capacity}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Capacity</option>
                    <option value="50">50+ guests</option>
                    <option value="100">100+ guests</option>
                    <option value="200">200+ guests</option>
                    <option value="500">500+ guests</option>
                  </select>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  <select
                    name="province"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={filters.province}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Provinces</option>
                    {allProvinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories */}
              {allCategories.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.slice(0, 8).map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategoryFilter(category)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.categories.includes(category)
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {formatCategory(category)}
                      </button>
                    ))}
                    {allCategories.length > 8 && (
                      <button className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200">
                        +{allCategories.length - 8} more
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Services */}
              {allServices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Services</label>
                  <div className="flex flex-wrap gap-2">
                    {allServices.slice(0, 8).map((service) => (
                      <button
                        key={service}
                        onClick={() => toggleServiceFilter(service)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.services.includes(service)
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {service}
                      </button>
                    ))}
                    {allServices.length > 8 && (
                      <button className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200">
                        +{allServices.length - 8} more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Venues Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Venues</h2>
            </div>
            <div className="text-sm text-gray-600">
              {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Venues Grid */}
          {filteredVenues.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No venues found matching your criteria.</p>
              <button onClick={clearFilters} className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
                Clear filters to see all venues
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  image={venue.image?.secure_url}
                  location={venue.location}
                  basePricePerHour={venue.basePricePerHour}
                  capacity={venue.capacity}
                  services={venue.services}
                  reviews={venue.reviews}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
