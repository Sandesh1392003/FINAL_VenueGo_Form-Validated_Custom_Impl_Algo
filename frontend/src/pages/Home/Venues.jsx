"use client"

import { useEffect, useState } from "react"
import { Search, X, Filter, ChevronDown } from "lucide-react"
import VenueCard from "../common/VenueCard"
import { useQuery } from "@apollo/client"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import Loader from "../common/Loader"

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

      applyFiltersAndSort(data.venues)
    }
  }, [data])

  useEffect(() => {
    if (data?.venues) {
      applyFiltersAndSort(data.venues)
    }
  }, [searchTerm, sortBy, filters])

  const applyFiltersAndSort = (venues) => {
    let filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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

  if (loading) return <Loader />
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Find Your Perfect Venue</h1>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex-grow relative max-w-md">
            <input
              type="text"
              placeholder="Search venues..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="capacity">Largest Capacity</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            <button
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm transition-colors ${
                isFilterVisible
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <Filter size={16} />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="flex items-center justify-center bg-gray-700 text-white rounded-full w-5 h-5 text-xs">
                  {Object.values(filters).flat().filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isFilterVisible && (
          <div className="mb-6 p-4 bg-white rounded-md border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-700">Filters</h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Capacity</label>
                <select
                  name="capacity"
                  className="w-full py-1.5 px-2 text-sm border border-gray-200 rounded-md"
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Province</label>
                <select
                  name="province"
                  className="w-full py-1.5 px-2 text-sm border border-gray-200 rounded-md"
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
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Categories</label>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.slice(0, 8).map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategoryFilter(category)}
                      className={`px-2 py-1 rounded-md text-xs transition-colors ${
                        filters.categories.includes(category)
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {formatCategory(category)}
                    </button>
                  ))}
                  {allCategories.length > 8 && (
                    <button className="px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-500 hover:bg-gray-100">
                      +{allCategories.length - 8} more
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Services */}
            {allServices.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Services</label>
                <div className="flex flex-wrap gap-1.5">
                  {allServices.slice(0, 8).map((service) => (
                    <button
                      key={service}
                      onClick={() => toggleServiceFilter(service)}
                      className={`px-2 py-1 rounded-md text-xs transition-colors ${
                        filters.services.includes(service)
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                  {allServices.length > 8 && (
                    <button className="px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-500 hover:bg-gray-100">
                      +{allServices.length - 8} more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""} found
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-md border border-gray-200">
            <p className="text-gray-500">No venues found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue, index) => (
              <VenueCard
                key={index}
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
      </main>
    </div>
  )
}
