"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, X, CheckCircle2, Sparkles, Zap, TrendingUp } from "lucide-react"
import VenueCard from "../pages/common/VenueCard"
import { useQuery } from "@apollo/client"
import { VENUES } from "./Graphql/query/venuesGql"
import Loader from "../pages/common/Loader"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [sortBy, setSortBy] = useState("price")
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    capacity: "",
    categories: [],
    province: "",
    services: [],
  })

  const [venues, setVenues] = useState([])
  const { data, error, loading } = useQuery(VENUES)
  const [allServices, setAllServices] = useState([])
  const [allProvinces, setAllProvinces] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [filteredVenues, setFilteredVenues] = useState([])

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
      setVenues(data.venues)
      applyFiltersAndSort(data.venues)
    }
  }, [data])

  useEffect(() => {
    if (venues.length > 0) {
      applyFiltersAndSort(venues)
    }
  }, [searchTerm, sortBy, filters])

  const applyFiltersAndSort = (venueList) => {
    let filtered = venueList.filter(
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

    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter((venue) => venue.basePricePerHour >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((venue) => venue.basePricePerHour <= Number(filters.maxPrice))
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
      minPrice: "",
      maxPrice: "",
      capacity: "",
      categories: [],
      province: "",
      services: [],
    })
    setSearchTerm("")
  }

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.capacity ||
      filters.categories.length > 0 ||
      filters.province ||
      filters.services.length > 0
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
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-lg font-semibold bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-red-200">
          Error: {error.message}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-violet-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-indigo-400/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-40 left-1/3 w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-bounce delay-1000"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Stunning Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-indigo-600/5 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 backdrop-blur-sm border border-purple-200/30 rounded-full px-4 py-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 font-bold text-xs tracking-wide">PREMIUM VENUES</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2 tracking-tight">
              Find Your Perfect Event Space
            </h1>
            <p className="text-slate-600 text-sm font-medium">
              Discover extraordinary venues for unforgettable experiences
            </p>
          </div>
        </div>

        {/* Ultra-Modern Search Section */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

            <div className="relative bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
              <input
                type="text"
                placeholder="Search venues by name or city..."
                className="w-full pl-14 pr-6 py-4 bg-transparent rounded-2xl focus:outline-none text-slate-900 placeholder-slate-500 font-medium text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Search className="text-white" size={18} />
                  </div>
                </div>
              </div>

              {/* Search Suggestions Indicator */}
              {searchTerm && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {/* Premium Sort Dropdown */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <select
                className="relative appearance-none bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl px-5 py-4 focus:outline-none shadow-2xl hover:shadow-3xl transition-all duration-300 text-slate-900 font-semibold min-w-[200px] cursor-pointer group-hover:scale-105"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">💰 Price: Low → High</option>
                <option value="priceDesc">💎 Price: High → Low</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="capacity">👥 Largest Capacity</option>
              </select>

              {/* Custom Dropdown Arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <TrendingUp className="w-4 h-4 text-purple-600 group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </div>

            {/* Spectacular Filter Button */}
            <button
              className="relative group overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-4 px-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <SlidersHorizontal
                    size={18}
                    className={`transition-all duration-500 ${isFilterVisible ? "rotate-180 text-yellow-300" : "rotate-0"}`}
                  />
                </div>
                <span className="hidden sm:inline font-bold">{isFilterVisible ? "Hide" : "Show"} Filters</span>

                {/* Active Filters Indicator */}
                {hasActiveFilters() && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white"></div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Spectacular Advanced Filters */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${isFilterVisible ? "max-h-[600px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
            }`}
        >
          <div className="relative group">
            {/* Magical Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-500"></div>

            <div className="relative bg-white/90 backdrop-blur-3xl border border-white/70 rounded-3xl shadow-2xl p-8 group-hover:shadow-3xl transition-all duration-500">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-50"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-2xl">
                      <Zap className="text-white animate-pulse" size={20} />
                    </div>
                  </div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                    Advanced Filters
                  </h2>
                </div>

                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="group flex items-center gap-2 text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Premium Price Range */}
                <div className="space-y-3 group">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="text-lg">💰</span>
                    Price Range (per hour)
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        className="w-full py-3 px-4 bg-white/90 border-2 border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-slate-900 font-medium shadow-lg hover:shadow-xl"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        className="w-full py-3 px-4 bg-white/90 border-2 border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-slate-900 font-medium shadow-lg hover:shadow-xl"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity Selector */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="text-lg">👥</span>
                    Minimum Capacity
                  </label>
                  <select
                    name="capacity"
                    className="w-full py-3 px-4 bg-white/90 border-2 border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-slate-900 font-medium cursor-pointer shadow-lg hover:shadow-xl"
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

                {/* Province Selector */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="text-lg">📍</span>
                    Province
                  </label>
                  <select
                    name="province"
                    className="w-full py-3 px-4 bg-white/90 border-2 border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-slate-900 font-medium cursor-pointer shadow-lg hover:shadow-xl"
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

              {/* Spectacular Categories */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
                  <span className="text-lg">🏛️</span>
                  Venue Categories
                </label>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategoryFilter(category)}
                      className={`group relative overflow-hidden px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${filters.categories.includes(category)
                          ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white"
                          : "bg-white/90 text-slate-700 hover:bg-white border-2 border-purple-200/50 hover:border-purple-300"
                        }`}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                      <div className="relative flex items-center gap-2">
                        {formatCategory(category)}
                        {filters.categories.includes(category) && <CheckCircle2 className="w-4 h-4 animate-pulse" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amazing Services */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
                  <span className="text-lg">⚡</span>
                  Services
                </label>
                <div className="flex flex-wrap gap-3">
                  {allServices.map((service) => (
                    <button
                      key={service}
                      onClick={() => toggleServiceFilter(service)}
                      className={`group relative overflow-hidden px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${filters.services.includes(service)
                          ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white"
                          : "bg-white/90 text-slate-700 hover:bg-white border-2 border-purple-200/50 hover:border-purple-300"
                        }`}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                      <div className="relative flex items-center gap-2">
                        {service}
                        {filters.services.includes(service) && <CheckCircle2 className="w-4 h-4 animate-pulse" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spectacular Featured Venues Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-2xl">
                  <Sparkles className="text-white" size={20} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Featured Venues
              </h2>
            </div>

            {/* Results Counter */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/70 rounded-2xl px-4 py-2 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-900">
                    {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Grid */}
          {filteredVenues.length === 0 ? (
            <div className="text-center py-16 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-indigo-600/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-2xl p-12 group-hover:shadow-3xl transition-all duration-500">
                <div className="text-6xl mb-4 animate-bounce">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No venues found</h3>
                <p className="text-slate-600">Try adjusting your search criteria to discover more venues.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredVenues.slice(0, 6).map((venue, index) => (
                <div
                  key={venue.id}
                  className="animate-fade-in-up hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <VenueCard
                    id={venue.id}
                    name={venue.name}
                    image={venue.image?.secure_url}
                    location={venue.location}
                    basePricePerHour={venue.basePricePerHour}
                    capacity={venue.capacity}
                    services={venue.services}
                    reviews={venue.reviews}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Spectacular View All Button */}
          {filteredVenues.length > 6 && (
            <div className="text-center">
              <button
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
                onClick={() => navigate("/Venues")}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative flex items-center gap-3">
                  <span>View All Venues</span>
                  <div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                    <Sparkles size={18} />
                  </div>
                </div>
              </button>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default HomePage
