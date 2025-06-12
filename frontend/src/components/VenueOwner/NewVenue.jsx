"use client"

import { useState, useEffect } from "react"
import {
  Loader,
  Trash2,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ImageIcon,
  Package,
  AlertCircle,
  Clock,
  Tag,
  Info,
  Camera,
  Building,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation, useQuery } from "@apollo/client"
import { ADD_VENUE } from "../Graphql/mutations/VenueGql"
import { GET_SERVICES } from "../Graphql/query/venuesGql"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { MY_VENUES } from "../Graphql/query/meGql"

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

const AddVenue = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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
    facilities: [],
    categories: [],
    image: null,
    services: [],
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [cities, setCities] = useState([])
  const [cityData, setCityData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedServices, setSelectedServices] = useState([])
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { uploadImage } = useUploadImage()
  const { deleteImage } = useDeleteImage()
  const [addVenue] = useMutation(ADD_VENUE, {
    refetchQueries: [{ query: MY_VENUES }],
    awaitRefetchQueries: true,
  })
  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES)

  // Format category for display
  const formatCategory = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

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

  useEffect(() => {
    if (venue.location.province) {
      setCities(cityData[venue.location.province] || [])
    }
  }, [venue.location.province, cityData])

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

      // Clear image error if it exists
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }))
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, GIF, etc.)")
        return
      }

      setVenue((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))

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
  }

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

  const handleCategoryToggle = (category) => {
    setVenue((prev) => {
      const categories = [...prev.categories]

      if (categories.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          categories: categories.filter((c) => c !== category),
        }
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...categories, category],
        }
      }
    })

    // Clear error when categories are selected
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: null }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Basic Information
        if (!venue.name.trim()) newErrors.name = "Venue name is required"
        if (!venue.description.trim()) newErrors.description = "Description is required"
        if (!venue.categories || venue.categories.length === 0)
          newErrors.categories = "At least one category is required"
        break

      case 2: // Location
        if (!venue.location.street.trim()) newErrors.street = "Street address is required"
        if (!venue.location.province) newErrors.province = "Province is required"
        if (!venue.location.city) newErrors.city = "City is required"
        if (venue.location.zipCode && isNaN(venue.location.zipCode)) {
          newErrors.zipCode = "Zip code must be a number"
        }
        break

      case 3: // Capacity & Price
        if (!venue.basePricePerHour || isNaN(venue.basePricePerHour) || venue.basePricePerHour <= 0) {
          newErrors.basePricePerHour = "Valid price per hour is required"
        }
        if (!venue.capacity || isNaN(venue.capacity) || venue.capacity <= 0) {
          newErrors.capacity = "Valid capacity is required"
        }
        break

      case 4: // Services
        const invalidServices = selectedServices.filter(
          (service) => !service.servicePrice || isNaN(service.servicePrice) || service.servicePrice <= 0,
        )

        if (invalidServices.length > 0) {
          newErrors.services = "All selected services must have a valid price"
        }
        break

      case 5: // Image
        if (!venue.image) {
          newErrors.image = "Venue image is required"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      // Display errors
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitted(true)

    // Final validation
    if (!validateStep(currentStep)) {
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error)
      })
      return
    }

    setIsSubmitting(true)
    let requiredImageProps = null

    const venueMutation = async () => {
      if (venue.image) {
        try {
          const imageData = await uploadImage(
            venue.image,
            import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
            import.meta.env.VITE_UPLOAD_VENUE_IMAGE_FOLDER,
          )
          if (!imageData) throw new Error("Failed to upload image")

          requiredImageProps = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
          }
        } catch (error) {
          console.error("Image Upload Error:", error)
          throw new Error("Image upload failed")
        }
      }

      try {
        // Format services for the mutation
        const formattedServices = selectedServices.map((service) => ({
          serviceId: service.serviceId,
          servicePrice: Number.parseInt(service.servicePrice, 10),
          category: service.category, // Include the pricing category (hourly/fixed)
        }))

        const response = await addVenue({
          variables: {
            venueInput: {
              name: venue.name,
              description: venue.description,
              location: {
                ...venue.location,
                zipCode: venue.location.zipCode ? Number.parseInt(venue.location.zipCode, 10) : null,
              },
              basePricePerHour: Number.parseInt(venue.basePricePerHour, 10),
              capacity: Number.parseInt(venue.capacity, 10),
              categories: venue.categories, // Changed from category to categories
              image: requiredImageProps,
              services: formattedServices,
            },
          },
        })

        if (!response.data?.addVenue) throw new Error("Failed to create venue")
        return response.data.addVenue
      } catch (err) {
        console.error("GraphQL Error:", err)
        if (requiredImageProps) {
          try {
            await deleteImage(requiredImageProps.public_id)
          } catch (deleteError) {
            console.error("Image Delete Error:", deleteError)
          }
        }
        throw new Error(err.message || "Venue creation failed")
      }
    }

    toast
      .promise(venueMutation(), {
        loading: "Adding venue...",
        success: "Venue added successfully!",
        error: (err) => `Failed to add venue: ${err.message}`,
      })
      .then(() => {
        navigate("/dashboard/my-venues")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Basic Information</h2>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Venue Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={venue.name}
                onChange={handleChange}
                placeholder="Enter venue name"
                className={`mt-1 block w-full rounded-lg border ${
                  errors.name ? "border-rose-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={venue.description}
                onChange={handleChange}
                placeholder="Describe your venue in detail"
                rows="4"
                className={`mt-1 block w-full rounded-lg border ${
                  errors.description ? "border-rose-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-rose-500">{errors.description}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Venue Categories <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-gray-500">Selected: {venue.categories.length}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Select all categories that apply to your venue</p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {VENUE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      venue.categories.includes(category)
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          venue.categories.includes(category) ? "bg-gray-900 border-gray-900" : "border-gray-300"
                        }`}
                      >
                        {venue.categories.includes(category) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <span className="ml-2 text-sm">{formatCategory(category)}</span>
                  </div>
                ))}
              </div>
              {errors.categories && <p className="mt-1 text-sm text-rose-500">{errors.categories}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Location Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  Province <span className="text-rose-500">*</span>
                </label>
                <select
                  id="province"
                  name="location.province"
                  value={venue.location.province}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.province ? "border-rose-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                >
                  <option value="">Select a province</option>
                  {Object.keys(cityData).map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="mt-1 text-sm text-rose-500">{errors.province}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  id="city"
                  name="location.city"
                  value={venue.location.city}
                  onChange={handleChange}
                  disabled={!venue.location.province}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.city ? "border-rose-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-rose-500">{errors.city}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="location.street"
                  value={venue.location.street}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.street ? "border-rose-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                />
                {errors.street && <p className="mt-1 text-sm text-rose-500">{errors.street}</p>}
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
                  placeholder="Optional"
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.zipCode ? "border-rose-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                />
                {errors.zipCode && <p className="mt-1 text-sm text-rose-500">{errors.zipCode}</p>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    Providing accurate location details helps customers find your venue easily. Make sure to include any
                    landmarks or special directions in the street address if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Capacity & Pricing</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="basePricePerHour" className="block text-sm font-medium text-gray-700">
                  Base Price per Hour (Rs.) <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
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
                    placeholder="0"
                    className={`block w-full pl-12 pr-12 py-2 rounded-lg border ${
                      errors.basePricePerHour ? "border-rose-500" : "border-gray-300"
                    } shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/hour</span>
                  </div>
                </div>
                {errors.basePricePerHour && <p className="mt-1 text-sm text-rose-500">{errors.basePricePerHour}</p>}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity (Number of People) <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
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
                    placeholder="0"
                    className={`block w-full pl-10 py-2 rounded-lg border ${
                      errors.capacity ? "border-rose-500" : "border-gray-300"
                    } shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                  />
                </div>
                {errors.capacity && <p className="mt-1 text-sm text-rose-500">{errors.capacity}</p>}
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Pricing Tips</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Set a competitive base price that reflects your venue's value. You can add additional services in
                    the next step to increase your revenue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <Package className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Services</h2>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Services (Optional)</label>
                <span className="text-xs text-gray-500">Selected: {selectedServices.length}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Select the services you offer with this venue and set your pricing for each service.
              </p>

              {servicesLoading ? (
                <div className="flex justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <Loader className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Loading services...</p>
                  </div>
                </div>
              ) : servicesData?.services?.length > 0 ? (
                <div className="space-y-4">
                  {servicesData.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                    const selectedService = selectedServices.find((s) => s.serviceId === service.id)

                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className={`h-5 w-5 rounded-md border ${
                                isSelected ? "bg-gray-900 border-gray-900" : "border-gray-300"
                              } flex items-center justify-center`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </button>
                          </div>

                          {/* Service Image */}
                          {service.image?.secure_url && (
                            <div className="ml-3 mr-3 flex-shrink-0">
                              <img
                                src={service.image.secure_url || "/placeholder.svg"}
                                alt={service.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            </div>
                          )}

                          <div className="ml-3 flex-grow">
                            <div className="flex justify-between">
                              <label
                                htmlFor={`service-${service.id}`}
                                className="font-medium text-gray-700 cursor-pointer"
                              >
                                {service.name}
                              </label>
                              <span className="text-sm text-gray-500">Base: Rs. {service.basePricePerHour}/hour</span>
                            </div>

                            {isSelected && (
                              <div className="mt-3 space-y-3">
                                {/* Pricing Category Selection */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                                  <div className="flex space-x-4">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`hourly-${service.id}`}
                                        name={`pricing-type-${service.id}`}
                                        checked={selectedService.category === "hourly"}
                                        onChange={() => handleServiceCategoryChange(service.id, "hourly")}
                                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300"
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
                                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300"
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
                                    className="block text-sm font-medium text-gray-700"
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
                                      placeholder="0"
                                      className="block w-full pl-12 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
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
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <Package className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">No services available</p>
                </div>
              )}

              {errors.services && <p className="mt-2 text-sm text-rose-500">{errors.services}</p>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Venue Image</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Venue Image <span className="text-rose-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload a high-quality image of your venue. This will be the main image displayed to potential customers.
              </p>

              <div
                className={`mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 ${
                  errors.image ? "border-rose-300" : isDragging ? "border-gray-900" : "border-gray-300"
                } border-dashed rounded-lg transition-colors ${isDragging ? "bg-gray-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="space-y-3 text-center py-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex flex-col text-sm text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-gray-900 hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500"
                      >
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose a file
                        </span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Venue preview"
                      className="h-64 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 bg-white bg-opacity-75 text-gray-700 rounded-full p-2 hover:bg-opacity-100 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {errors.image && <p className="mt-2 text-sm text-rose-500">{errors.image}</p>}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">Image Tips</h3>
                  <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Use high-quality, well-lit images that showcase your venue's best features</li>
                    <li>Landscape orientation works best for venue listings</li>
                    <li>Ensure the image represents your venue accurately to set proper expectations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-900 rounded-full p-2 text-white">
                <Check className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold ml-2">Review & Submit</h2>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Summary</h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{venue.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categories</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {venue.categories.length > 0 ? (
                          venue.categories.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {formatCategory(category)}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">None selected</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm mt-1">{venue.description}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Location</h4>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p>
                      {venue.location.street}, {venue.location.city}, {venue.location.province}
                      {venue.location.zipCode ? `, ${venue.location.zipCode}` : ""}
                    </p>
                  </div>
                </div>

                {/* Capacity & Pricing */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Capacity & Pricing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{venue.capacity} people</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Base Price</p>
                        <p className="font-medium">Rs. {venue.basePricePerHour}/hour</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Services</h4>
                    <div className="space-y-2">
                      {selectedServices.map((service) => {
                        const serviceDetails = servicesData?.services.find((s) => s.id === service.serviceId)
                        return (
                          <div key={service.serviceId} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center">
                              {serviceDetails?.image?.secure_url && (
                                <img
                                  src={serviceDetails.image.secure_url || "/placeholder.svg"}
                                  alt={serviceDetails?.name || "Service"}
                                  className="w-8 h-8 object-cover rounded-md mr-2"
                                />
                              )}
                              <span>{serviceDetails?.name || "Service"}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">Rs. {service.servicePrice}</span>
                              <span className="text-gray-500 text-xs ml-1">
                                ({service.category === "hourly" ? "per hour" : "fixed"})
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Venue Image */}
                {imagePreview && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Venue Image</h4>
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Venue preview"
                        className="h-48 w-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    Please review all information carefully. Click the Submit button below to create your venue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Progress bar calculation
  const totalSteps = 6
  const progress = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Venue</h1>
            <p className="text-sm text-gray-500 mt-1">Complete all steps to list your venue</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/my-venues")}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Venues
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="hidden md:flex justify-between mb-8">
          {[...Array(totalSteps)].map((_, index) => {
            const stepNum = index + 1
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep

            return (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : isCompleted
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                <span className="text-xs mt-1 text-gray-500">
                  {stepNum === 1 && "Basics"}
                  {stepNum === 2 && "Location"}
                  {stepNum === 3 && "Pricing"}
                  {stepNum === 4 && "Services"}
                  {stepNum === 5 && "Image"}
                  {stepNum === 6 && "Review"}
                </span>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <div className="flex items-center">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </div>
                </button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <div className="flex items-center">
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Create Venue
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddVenue
