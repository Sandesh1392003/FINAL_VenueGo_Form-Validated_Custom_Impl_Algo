"use client"

import { useState, useEffect } from "react"
import {
  Loader,
  Trash2,
  Upload,
  ChevronLeft,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ImageIcon,
  AlertCircle,
  Check,
  Tag,
  Clock,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation, useQuery } from "@apollo/client"
import { UPDATE_VENUE } from "../Graphql/mutations/VenueGql"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { VENUE_BY_ID } from "../Graphql/query/venuesGql"
import { GET_SERVICES } from "../Graphql/query/venuesGql"

const VENUE_CATEGORIES = [
  "WEDDING",
  "CONFERENCE_HALL",
  "PARTY_HALL",
  "BANQUET",
  "OUTDOOR",
  "MEETING_ROOM",
  "SEMINAR_HALL",
  "CONCERT_HALL",
  "EXHIBITION_CENTER",
  "THEATER",
  "SPORTS_ARENA",
  "RESORT",
  "GARDEN",
  "CLUBHOUSE",
  "ROOFTOP",
  "RESTAURANT",
  "AUDITORIUM",
  "BEACH_VENUE",
  "CONVENTION_CENTER",
  "TRAINING_CENTER",
  "COWORKING_SPACE",
  "PRIVATE_VILLA",
  "CORPORATE_EVENT_SPACE",
]

const EditVenue = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Queries and mutations
  const { data, loading, error } = useQuery(VENUE_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only", // Ensure we get fresh data
  })

  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES)
  const { uploadImage, loading: uLoading } = useUploadImage()
  const { deleteImage, loading: dLoading } = useDeleteImage()
  const [updateVenue, { loading: vLoading }] = useMutation(UPDATE_VENUE)

  // State
  const [venue, setVenue] = useState({
    name: "",
    description: "",
    location: {
      street: "",
      province: "",
      city: "",
      zipCode: "",
    },
    basePricePerHour: "",
    capacity: "",
    categories: [], // Changed from category to categories (array)
    image: null,
    services: [],
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [cities, setCities] = useState([])
  const [cityData, setCityData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedServices, setSelectedServices] = useState([])
  const [currentImage, setCurrentImage] = useState(null)
  const [hasImageChanged, setHasImageChanged] = useState(false)

  // Initialize venue data when it's loaded
  useEffect(() => {
    if (data?.venue) {
      const venueData = data.venue

      // Convert single category to array if needed
      const categories = venueData.categories || (venueData.category ? [venueData.category] : [])

      setVenue({
        name: venueData.name || "",
        description: venueData.description || "",
        location: {
          street: venueData.location?.street || "",
          province: venueData.location?.province || "",
          city: venueData.location?.city || "",
          zipCode: venueData.location?.zipCode?.toString() || "",
        },
        basePricePerHour: venueData.basePricePerHour?.toString() || "",
        capacity: venueData.capacity?.toString() || "",
        categories: categories, // Use array of categories
        image: null,
        services: venueData.services || [],
      })

      // Set current image if it exists
      if (venueData.image?.secure_url) {
        setCurrentImage(venueData.image)
      }

      // Initialize selected services
      if (venueData.services && venueData.services.length > 0) {
        setSelectedServices(
          venueData.services.map((service) => ({
            serviceId: service.serviceId.id,
            servicePrice: service.servicePrice?.toString() || "",
            category: service.category || "hourly", // Default to hourly if not specified
          })),
        )
      }

      // Set cities based on province
      if (venueData.location?.province) {
        setCities(cityData[venueData.location.province] || [])
      }
    }
  }, [data, cityData])

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Initialize city data
  useEffect(() => {
    setCityData({
      Koshi: ["Biratnagar", "Dharan", "Itahari", "Birtamod", "Dhankuta", "Inaruwa", "Mechinagar"],
      Madhesh: ["Janakpur", "Birgunj", "Kalaiya", "Rajbiraj", "Gaur", "Lahan", "Malangwa"],
      Bagmati: ["Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda", "Chitwan", "Banepa", "Sindhuli"],
      Gandaki: ["Pokhara", "Baglung", "Damauli", "Beni", "Gorkha", "Waling", "Tansen"],
      Lumbini: ["Butwal", "Nepalgunj", "Dang", "Tulsipur", "Kapilvastu", "Bardiya", "Sandhikharka"],
      Karnali: ["Surkhet", "Jumla", "Dailekh", "Kalikot", "Mugu", "Jajarkot", "Dolpa"],
      Sudurpaschim: ["Dhangadhi", "Mahendranagar", "Dadeldhura", "Baitadi", "Darchula", "Tikapur", "Amargadhi"],
    })
  }, [])

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return ""
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]
      setVenue((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))

      if (locationField === "province") {
        setCities(cityData[value] || [])
        setVenue((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            city: "",
          },
        }))
      }
    } else {
      setVenue((prev) => ({ ...prev, [name]: value }))
    }

    // Clear errors when input changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setVenue((prev) => {
      const isSelected = prev.categories.includes(category)

      if (isSelected) {
        // Remove category if already selected
        return {
          ...prev,
          categories: prev.categories.filter((cat) => cat !== category),
        }
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...prev.categories, category],
        }
      }
    })

    // Clear category error if any
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: null }))
    }
  }

  // Handle image management
  const handleImageUpload = (e) => {
    const file = e.target.files[0]

    // Validate file is an image
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, GIF, etc.)")
        return
      }

      setVenue((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
      setHasImageChanged(true)

      // Clear image error if it exists
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }))
      }
    }
  }

  const handleImageRemove = () => {
    setVenue((prev) => ({ ...prev, image: null }))
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setCurrentImage(null)
    setHasImageChanged(true)
  }

  // Handle service management
  const handleServiceToggle = (serviceId) => {
    const isSelected = selectedServices.some((s) => s.serviceId === serviceId)

    if (isSelected) {
      setSelectedServices(selectedServices.filter((s) => s.serviceId !== serviceId))
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          servicePrice: "",
          category: "hourly", // Default to hourly pricing
        },
      ])
    }
  }

  const handleServicePriceChange = (serviceId, price) => {
    setSelectedServices(
      selectedServices.map((service) =>
        service.serviceId === serviceId ? { ...service, servicePrice: price } : service,
      ),
    )
  }

  const handleServiceCategoryChange = (serviceId, category) => {
    setSelectedServices(
      selectedServices.map((service) => (service.serviceId === serviceId ? { ...service, category } : service)),
    )
  }

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {}

    if (!venue.name.trim()) newErrors.name = "Venue name is required"
    if (!venue.description.trim()) newErrors.description = "Description is required"
    if (!venue.location.street.trim()) newErrors.street = "Street address is required"
    if (!venue.location.province) newErrors.province = "Province is required"
    if (!venue.location.city) newErrors.city = "City is required"

    if (!venue.basePricePerHour || isNaN(venue.basePricePerHour) || Number(venue.basePricePerHour) <= 0) {
      newErrors.basePricePerHour = "Valid price per hour is required"
    }

    if (!venue.capacity || isNaN(venue.capacity) || Number(venue.capacity) <= 0) {
      newErrors.capacity = "Valid capacity is required"
    }

    if (!venue.categories || venue.categories.length === 0) {
      newErrors.categories = "At least one category is required"
    }

    // Validate service prices if any are selected
    const invalidServices = selectedServices.filter(
      (service) => !service.servicePrice || isNaN(service.servicePrice) || Number(service.servicePrice) <= 0,
    )

    if (invalidServices.length > 0) {
      newErrors.services = "All selected services must have a valid price"
    }

    // If image was removed and no new image was uploaded
    if (hasImageChanged && !venue.image && !currentImage) {
      newErrors.image = "Venue image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      // Display errors
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
      return
    }

    setIsSubmitting(true)
    let imageProps = currentImage

    const venueMutation = async () => {
      // Handle image upload if changed
      if (hasImageChanged && venue.image) {
        try {
          const imageData = await uploadImage(
            venue.image,
            import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
            import.meta.env.VITE_UPLOAD_VENUE_IMAGE_FOLDER,
          )

          if (!imageData) throw new Error("Failed to upload image")

          imageProps = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            asset_id: imageData.asset_id,
            version: Number.parseInt(imageData.version, 10),
            format: imageData.format,
            width: Number.parseInt(imageData.width, 10),
            height: Number.parseInt(imageData.height, 10),
            created_at: imageData.created_at,
          }

          // Delete old image if it exists
          if (currentImage?.public_id) {
            try {
              await deleteImage(currentImage.public_id)
            } catch (deleteError) {
              console.error("Failed to delete old image:", deleteError)
            }
          }
        } catch (error) {
          console.error("Image Upload Error:", error)
          throw new Error("Image upload failed")
        }
      } else if (hasImageChanged && !venue.image) {
        // If image was removed, set to null
        imageProps = null

        // Delete old image if it exists
        if (currentImage?.public_id) {
          try {
            await deleteImage(currentImage.public_id)
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError)
          }
        }
      }

      try {
        // Remove __typename from objects to avoid GraphQL errors
        const cleanImageProps = imageProps ? removeTypename(imageProps) : null
        const cleanLocation = removeTypename(venue.location)

        // Format services for the mutation
        const formattedServices = selectedServices.map((service) => ({
          serviceId: service.serviceId,
          servicePrice: Number.parseInt(service.servicePrice, 10),
          category: service.category, // Include the pricing category (hourly/fixed)
        }))

        const response = await updateVenue({
          variables: {
            updateVenueInput: {
              name: venue.name,
              description: venue.description,
              location: {
                ...cleanLocation,
                zipCode: venue.location.zipCode ? Number.parseInt(venue.location.zipCode, 10) : null,
              },
              basePricePerHour: Number.parseInt(venue.basePricePerHour, 10),
              capacity: Number.parseInt(venue.capacity, 10),
              categories: venue.categories, // Send array of categories
              image: cleanImageProps,
              services: formattedServices,
            },
            id,
          },
        })

        const { success, message } = response.data?.updateVenue
        if (!success) {
          throw new Error(message || "Failed to update venue")
        }

        return message
      } catch (err) {
        console.error("GraphQL Error:", err)
        throw new Error(err.message || "Venue update failed")
      }
    }

    toast
      .promise(venueMutation(), {
        loading: "Updating venue...",
        success: (message) => message || "Venue updated successfully!",
        error: (err) => err.message || "Failed to update venue. Please try again.",
      })
      .then(() => {
        navigate("/dashboard/my-venues")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Helper function to remove __typename from objects
  const removeTypename = (obj) => {
    if (!obj) return null
    const { __typename, ...rest } = obj
    return rest
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg">Loading venue data...</span>
      </div>
    )

  if (error)
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Venue</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => navigate("/dashboard/my-venues")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to My Venues
        </button>
      </div>
    )

  if (!data?.venue)
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Not Found</h2>
        <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/dashboard/my-venues")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to My Venues
        </button>
      </div>
    )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-venues")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to My Venues
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Edit Venue</h1>
      <p className="text-gray-600 mb-6">Update your venue information below</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={venue.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={venue.description}
                onChange={handleChange}
                rows="4"
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>

          {/* Categories Section - Updated to support multiple categories */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <Tag className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Venue Categories</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Categories <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Select all categories that apply to your venue. This helps customers find your venue more easily.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {VENUE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      venue.categories.includes(category)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center mr-2 ${
                        venue.categories.includes(category) ? "bg-blue-500" : "border border-gray-300"
                      }`}
                    >
                      {venue.categories.includes(category) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">{formatCategory(category)}</span>
                  </div>
                ))}
              </div>

              {errors.categories && <p className="mt-2 text-sm text-red-500">{errors.categories}</p>}
            </div>
          </div>

          {/* Location Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Location Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  id="province"
                  name="location.province"
                  value={venue.location.province}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.province ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select a province</option>
                  {Object.keys(cityData).map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="location.city"
                  value={venue.location.city}
                  onChange={handleChange}
                  disabled={!venue.location.province}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="location.street"
                  value={venue.location.street}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.street ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="location.zipCode"
                  value={venue.location.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Pricing Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Capacity & Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="basePricePerHour" className="block text-sm font-medium text-gray-700">
                  Price per Hour (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rs.</span>
                  </div>
                  <input
                    type="number"
                    id="basePricePerHour"
                    name="basePricePerHour"
                    value={venue.basePricePerHour}
                    onChange={handleChange}
                    min="0"
                    className={`block w-full pl-12 pr-12 rounded-md border ${
                      errors.basePricePerHour ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/hour</span>
                  </div>
                </div>
                {errors.basePricePerHour && <p className="mt-1 text-sm text-red-500">{errors.basePricePerHour}</p>}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity (Number of People) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={venue.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`block w-full pl-10 rounded-md border ${
                      errors.capacity ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  />
                </div>
                {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Services</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Services (Optional)</label>
              <p className="text-sm text-gray-500 mb-4">
                Select the services you offer with this venue and set your pricing for each service.
              </p>

              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : servicesData?.services?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {servicesData.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                    const selectedService = selectedServices.find((s) => s.serviceId === service.id)

                    return (
                      <div
                        key={service.id}
                        className={`border rounded-md p-3 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`h-4 w-4 rounded border ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"} flex items-center justify-center`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </button>

                          <div className="flex-grow">
                            <label
                              htmlFor={`service-${service.id}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {service.name}
                            </label>

                            {isSelected && (
                              <div className="mt-3 space-y-3">
                                {/* Pricing Category Selection */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Pricing Type</label>
                                  <div className="flex space-x-4">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`hourly-${service.id}`}
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "hourly"}
                                        onChange={() => handleServiceCategoryChange(service.id, "hourly")}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <label
                                        htmlFor={`hourly-${service.id}`}
                                        className="ml-2 block text-sm text-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          Hourly
                                        </div>
                                      </label>
                                    </div>
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`fixed-${service.id}`}
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "fixed"}
                                        onChange={() => handleServiceCategoryChange(service.id, "fixed")}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <label
                                        htmlFor={`fixed-${service.id}`}
                                        className="ml-2 block text-sm text-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <Tag className="h-4 w-4 mr-1" />
                                          Fixed
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Price Input */}
                                <div>
                                  <label
                                    htmlFor={`price-${service.id}`}
                                    className="block text-xs font-medium text-gray-700"
                                  >
                                    Your Price {selectedService.category === "hourly" ? "per Hour" : ""} (Rs.)
                                  </label>
                                  <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                                    </div>
                                    <input
                                      type="number"
                                      id={`price-${service.id}`}
                                      value={selectedService?.servicePrice || ""}
                                      onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                                      min="0"
                                      className="block w-full pl-12 py-1 text-sm border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    {selectedService.category === "hourly" && (
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">/hour</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-3 text-gray-500 text-sm">No services available</p>
              )}

              {errors.services && <p className="mt-2 text-sm text-red-500">{errors.services}</p>}
            </div>
          </div>

          {/* Image Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 text-white">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Venue Image</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Venue Image <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload a high-quality image of your venue. This will be the main image displayed to potential customers.
              </p>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              {(imagePreview || currentImage?.secure_url) && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview || currentImage?.secure_url || "/placeholder.svg"}
                    alt="Venue preview"
                    className="h-48 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate("/dashboard/my-venues")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Updating Venue...
                  </div>
                ) : (
                  "Update Venue"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditVenue
