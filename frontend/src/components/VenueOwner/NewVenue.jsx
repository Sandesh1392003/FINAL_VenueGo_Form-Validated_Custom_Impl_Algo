"use client"

import { useState, useEffect } from "react"
import {
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
  AlertCircle,
  Camera,
  Building,
  ArrowLeft,
  Star,
  Sparkles,
  Home,
  Layers,
  Zap,
  CheckCircle2,
  ChevronDown,
  Palette,
  Calendar,
  Clock,
  Compass,
  Award,
  Briefcase,
  Lightbulb,
  Maximize,
  Wifi,
  Coffee,
  Droplet,
  Leaf,
  Flame,
  Hexagon,
  Triangle,
  Circle,
  Square,
} from "lucide-react"
import { useUploadImage } from "../Functions/UploadImage"
import { useDeleteImage } from "../Functions/deleteImage"
import { useMutation } from "@apollo/client"
import { ADD_VENUE } from "../Graphql/mutations/VenueGql"
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

// Category icons mapping
const CATEGORY_ICONS = {
  WEDDING: <Calendar className="h-4 w-4" />,
  CONFERENCE_HALL: <Briefcase className="h-4 w-4" />,
  PARTY_HALL: <Sparkles className="h-4 w-4" />,
  BANQUET: <Coffee className="h-4 w-4" />,
  OUTDOOR: <Leaf className="h-4 w-4" />,
  MEETING_ROOM: <Users className="h-4 w-4" />,
  SEMINAR_HALL: <Lightbulb className="h-4 w-4" />,
  CONCERT_HALL: <Flame className="h-4 w-4" />,
  EXHIBITION_CENTER: <Maximize className="h-4 w-4" />,
  THEATER: <Award className="h-4 w-4" />,
  SPORTS_ARENA: <Zap className="h-4 w-4" />,
  RESORT: <Droplet className="h-4 w-4" />,
  GARDEN: <Leaf className="h-4 w-4" />,
  CLUBHOUSE: <Star className="h-4 w-4" />,
  ROOFTOP: <Compass className="h-4 w-4" />,
  RESTAURANT: <Coffee className="h-4 w-4" />,
  AUDITORIUM: <Users className="h-4 w-4" />,
  BEACH_VENUE: <Droplet className="h-4 w-4" />,
  CONVENTION_CENTER: <Building className="h-4 w-4" />,
  TRAINING_CENTER: <Lightbulb className="h-4 w-4" />,
  COWORKING_SPACE: <Wifi className="h-4 w-4" />,
  PRIVATE_VILLA: <Home className="h-4 w-4" />,
  CORPORATE_EVENT_SPACE: <Briefcase className="h-4 w-4" />,
}

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
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { uploadImage } = useUploadImage()
  const { deleteImage } = useDeleteImage()
  const [addVenue] = useMutation(ADD_VENUE, {
    refetchQueries: [{ query: MY_VENUES }],
    awaitRefetchQueries: true,
  })

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

      case 4: // Image
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
              categories: venue.categories,
              image: requiredImageProps,
              services: [], // Empty services array since we removed that step
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
        navigate("/Dashboard/my-venues")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Define step data with colors and shapes
  const steps = [
    {
      number: 1,
      title: "Basics",
      icon: FileText,
      color: "bg-gradient-to-br from-purple-400 to-indigo-500",
      shape: <Hexagon className="absolute -z-10 text-purple-100 h-32 w-32 opacity-30 -top-10 -right-10 rotate-12" />,
    },
    {
      number: 2,
      title: "Location",
      icon: MapPin,
      color: "bg-gradient-to-br from-indigo-400 to-purple-500",
      shape: <Circle className="absolute -z-10 text-indigo-100 h-32 w-32 opacity-30 -bottom-10 -right-10" />,
    },
    {
      number: 3,
      title: "Pricing",
      icon: DollarSign,
      color: "bg-gradient-to-br from-violet-400 to-purple-500",
      shape: <Triangle className="absolute -z-10 text-violet-100 h-32 w-32 opacity-30 -top-10 -left-10 rotate-45" />,
    },
    {
      number: 4,
      title: "Image",
      icon: ImageIcon,
      color: "bg-gradient-to-br from-purple-400 to-fuchsia-500",
      shape: <Square className="absolute -z-10 text-purple-100 h-32 w-32 opacity-30 -bottom-10 -left-10 rotate-12" />,
    },
    {
      number: 5,
      title: "Review",
      icon: Check,
      color: "bg-gradient-to-br from-indigo-400 to-purple-500",
      shape: <Hexagon className="absolute -z-10 text-indigo-100 h-32 w-32 opacity-30 -top-10 -right-10 rotate-45" />,
    },
  ]

  // Get current step data
  const currentStepData = steps[currentStep - 1]

  // Calculate progress percentage
  const totalSteps = steps.length
  const progress = Math.round((currentStep / totalSteps) * 100)

  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 relative overflow-hidden">
            {currentStepData.shape}

            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl ${currentStepData.color} text-white shadow-lg`}
              >
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Tell Us About Your Venue
                </h2>
                <p className="text-slate-600 mt-1">Start with the basics to showcase your space</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <label htmlFor="name" className="block text-base font-medium text-slate-700 mb-2">
                  Venue Name <span className="text-purple-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={venue.name}
                  onChange={handleChange}
                  placeholder="Give your venue a memorable name"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.name ? "border-rose-300 bg-rose-50" : "border-purple-200"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg`}
                />
                {errors.name && <p className="mt-2 text-sm text-rose-500">{errors.name}</p>}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-br-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <label htmlFor="description" className="block text-base font-medium text-slate-700 mb-2">
                  Description <span className="text-purple-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={venue.description}
                  onChange={handleChange}
                  placeholder="Describe what makes your venue special. Include amenities, atmosphere, and unique features."
                  rows="5"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.description ? "border-rose-300 bg-rose-50" : "border-purple-200"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                ></textarea>
                {errors.description && <p className="mt-2 text-sm text-rose-500">{errors.description}</p>}
                <div className="mt-3 flex items-start text-xs text-slate-500 bg-purple-50 p-3 rounded-lg">
                  <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 text-purple-600" />
                  <p>A detailed description helps customers understand what to expect from your venue.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-tl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-medium text-slate-700">
                      Venue Categories <span className="text-purple-500">*</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Select all categories that apply to your venue</p>
                  </div>
                  <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full">
                    {venue.categories.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {VENUE_CATEGORIES.map((category) => (
                    <div
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`flex items-center p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${venue.categories.includes(category)
                          ? "border-purple-500 bg-purple-50 shadow-sm"
                          : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
                        }`}
                    >
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-lg ${venue.categories.includes(category)
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                            : "border-2 border-slate-200"
                          }`}
                      >
                        {venue.categories.includes(category) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          CATEGORY_ICONS[category] || <Palette className="h-4 w-4" />
                        )}
                      </div>
                      <span className="ml-2.5 text-sm font-medium">{formatCategory(category)}</span>
                    </div>
                  ))}
                </div>
                {errors.categories && <p className="mt-3 text-sm text-rose-500">{errors.categories}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 relative overflow-hidden">
            {currentStepData.shape}

            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl ${currentStepData.color} text-white shadow-lg`}
              >
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Where's Your Venue Located?
                </h2>
                <p className="text-slate-600 mt-1">Help customers find your space easily</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[120px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block text-base font-medium text-slate-700 mb-2">
                    Street Address <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      id="street"
                      name="location.street"
                      value={venue.location.street}
                      onChange={handleChange}
                      placeholder="Enter full street address"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${errors.street ? "border-rose-300 bg-rose-50" : "border-indigo-200"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                    />
                  </div>
                  {errors.street && <p className="mt-2 text-sm text-rose-500">{errors.street}</p>}
                </div>

                <div>
                  <label htmlFor="province" className="block text-base font-medium text-slate-700 mb-2">
                    Province <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="province"
                      name="location.province"
                      value={venue.location.province}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.province ? "border-rose-300 bg-rose-50" : "border-indigo-200"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white pr-10`}
                    >
                      <option value="">Select a province</option>
                      {Object.keys(cityData).map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  {errors.province && <p className="mt-2 text-sm text-rose-500">{errors.province}</p>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-base font-medium text-slate-700 mb-2">
                    City <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      name="location.city"
                      value={venue.location.city}
                      onChange={handleChange}
                      disabled={!venue.location.province}
                      className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.city ? "border-rose-300 bg-rose-50" : "border-indigo-200"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white pr-10 disabled:bg-slate-100 disabled:text-slate-400`}
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  {errors.city && <p className="mt-2 text-sm text-rose-500">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-base font-medium text-slate-700 mb-2">
                    ZIP Code <span className="text-slate-400 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="location.zipCode"
                    value={venue.location.zipCode}
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.zipCode ? "border-rose-300 bg-rose-50" : "border-indigo-200"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                  />
                  {errors.zipCode && <p className="mt-2 text-sm text-rose-500">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-200 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/50 rounded-tr-[100px] -z-10"></div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <Compass className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-indigo-800">Location Matters</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    Providing accurate location details helps customers find your venue easily. Consider adding nearby
                    landmarks or special directions in the street address field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 relative overflow-hidden">
            {currentStepData.shape}

            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl ${currentStepData.color} text-white shadow-lg`}
              >
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Set Your Pricing & Capacity
                </h2>
                <p className="text-slate-600 mt-1">Define how many people can fit and how much it costs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-violet-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-50 to-purple-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <label htmlFor="basePricePerHour" className="block text-base font-medium text-slate-700 mb-3">
                  Base Price per Hour <span className="text-violet-500">*</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="number"
                    id="basePricePerHour"
                    name="basePricePerHour"
                    value={venue.basePricePerHour}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className={`w-full pl-16 pr-20 py-4 rounded-xl border-2 ${errors.basePricePerHour ? "border-rose-300 bg-rose-50" : "border-violet-200"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-2xl font-bold text-slate-800 bg-white transition-all duration-300`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">/hour</span>
                  </div>
                </div>
                {errors.basePricePerHour && <p className="mt-2 text-sm text-rose-500">{errors.basePricePerHour}</p>}

                <div className="mt-4 flex items-center bg-violet-50 p-3 rounded-xl">
                  <Clock className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-violet-700">
                    This is the hourly rate customers will pay to book your venue
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-violet-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-violet-50 rounded-tr-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <label htmlFor="capacity" className="block text-base font-medium text-slate-700 mb-3">
                  Capacity <span className="text-violet-500">*</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={venue.capacity}
                    onChange={handleChange}
                    min="1"
                    placeholder="0"
                    className={`w-full pl-16 pr-20 py-4 rounded-xl border-2 ${errors.capacity ? "border-rose-300 bg-rose-50" : "border-violet-200"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-2xl font-bold text-slate-800 bg-white transition-all duration-300`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">people</span>
                  </div>
                </div>
                {errors.capacity && <p className="mt-2 text-sm text-rose-500">{errors.capacity}</p>}

                <div className="mt-4 flex items-center bg-violet-50 p-3 rounded-xl">
                  <Users className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-violet-700">Maximum number of people your venue can accommodate</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/50 rounded-bl-[100px] -z-10"></div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-violet-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-violet-800">Pricing Tips</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-violet-700">
                        Research similar venues in your area to set competitive pricing
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-violet-700">Consider seasonal demand when setting your base price</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-violet-700">
                        You can always adjust your pricing later based on booking demand
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8 relative overflow-hidden">
            {currentStepData.shape}

            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl ${currentStepData.color} text-white shadow-lg`}
              >
                <ImageIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                  Show Off Your Venue
                </h2>
                <p className="text-slate-600 mt-1">Upload a high-quality image to attract customers</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-fuchsia-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-bl-[120px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">Upload Venue Image</h3>
                  <p className="text-slate-500 mt-1">This will be the main image displayed to potential customers</p>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-3 py-1.5 rounded-full">
                  Required
                </span>
              </div>

              <div
                className={`mt-4 flex flex-col justify-center items-center px-6 pt-8 pb-8 border-3 ${errors.image
                    ? "border-rose-300 bg-rose-50"
                    : isDragging
                      ? "border-fuchsia-400 bg-fuchsia-50"
                      : "border-fuchsia-200"
                  } border-dashed rounded-2xl transition-all duration-300`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="space-y-6 text-center py-8">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100">
                      <Camera className="h-10 w-10 text-fuchsia-500" />
                    </div>
                    <div className="flex flex-col text-sm text-slate-600">
                      <p className="text-base font-medium text-slate-700 mb-2">Drag and drop your image here</p>
                      <p className="text-slate-500 mb-4">or</p>
                      <label htmlFor="image" className="relative cursor-pointer mx-auto">
                        <span className="inline-flex items-center px-6 py-3 border-2 border-fuchsia-300 rounded-xl shadow-sm text-base font-medium bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white hover:shadow-lg transition-all duration-300">
                          <Upload className="mr-2 h-5 w-5" />
                          Browse Files
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
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Venue preview"
                      className="h-80 w-full object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute top-0 right-0 p-2">
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-75 backdrop-blur-sm text-slate-700 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errors.image && <p className="mt-3 text-sm text-rose-500">{errors.image}</p>}
            </div>

            <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 p-5 rounded-2xl border border-fuchsia-200 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-fuchsia-100/50 rounded-tl-[100px] -z-10"></div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-fuchsia-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-fuchsia-800">Image Tips</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-fuchsia-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-fuchsia-700">
                        Use high-quality, well-lit images that showcase your venue's best features
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-fuchsia-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-fuchsia-700">Landscape orientation works best for venue listings</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-fuchsia-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-fuchsia-700">
                        Ensure the image represents your venue accurately to set proper expectations
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8 relative overflow-hidden">
            {currentStepData.shape}

            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl ${currentStepData.color} text-white shadow-lg`}
              >
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Review & Submit
                </h2>
                <p className="text-slate-600 mt-1">Verify your venue details before submitting</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[120px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-slate-900">{venue.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {venue.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {formatCategory(category)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-6">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Venue preview"
                      className="w-full h-64 object-cover rounded-xl shadow-sm"
                    />
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-blue-800">Location</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {venue.location.street}, {venue.location.city}, {venue.location.province}
                      {venue.location.zipCode ? `, ${venue.location.zipCode}` : ""}
                    </p>
                  </div>

                  {/* Pricing Card */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center mb-3">
                      <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                      <h4 className="font-medium text-amber-800">Pricing</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      <span className="font-bold text-lg">Rs. {venue.basePricePerHour}</span> per hour
                    </p>
                  </div>

                  {/* Capacity Card */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-200">
                    <div className="flex items-center mb-3">
                      <Users className="h-5 w-5 text-teal-500 mr-2" />
                      <h4 className="font-medium text-teal-800">Capacity</h4>
                    </div>
                    <p className="text-sm text-teal-700">
                      <span className="font-bold text-lg">{venue.capacity}</span> people
                    </p>
                  </div>

                  {/* Description Card */}
                  <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 p-4 rounded-xl border border-fuchsia-200">
                    <div className="flex items-center mb-3">
                      <FileText className="h-5 w-5 text-fuchsia-500 mr-2" />
                      <h4 className="font-medium text-fuchsia-800">Description</h4>
                    </div>
                    <p className="text-sm text-fuchsia-700 line-clamp-3">{venue.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-200 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/50 rounded-tr-[100px] -z-10"></div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-indigo-800">Final Check</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    Please review all information carefully. Once submitted, your venue will be visible to potential
                    customers. You can edit these details later if needed.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg mr-4">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Add New Venue
              </h1>
              <p className="text-slate-500 mt-1">List your space and start earning</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/Dashboard/my-venues")}
            className="inline-flex items-center px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Layers className="h-5 w-5 text-slate-500 mr-2" />
              <span className="text-base font-medium text-slate-700">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <span className="text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {progress}% Complete
            </span>
          </div>

          <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentStepData.color} transition-all duration-500 ease-in-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-10 px-2">
          {steps.map((step) => {
            const isActive = step.number === currentStep
            const isCompleted = step.number < currentStep
            const Icon = step.icon

            return (
              <div key={step.number} className="flex flex-col items-center relative group">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-md transition-all duration-300 ${isActive
                      ? `${step.color} text-white scale-110`
                      : isCompleted
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <span
                  className={`text-sm mt-2 font-medium transition-all duration-300 ${isActive ? "text-slate-800 scale-105" : isCompleted ? "text-emerald-600" : "text-slate-500"
                    }`}
                >
                  {step.title}
                </span>

                {/* Connecting line */}
                {step.number < totalSteps && (
                  <div className="absolute top-6 left-full w-full h-0.5 bg-slate-200 -z-10">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 ${isCompleted ? "w-full" : "w-0"
                        }`}
                    ></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Form Container */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-slate-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm flex items-center"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous Step
                </button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`px-6 py-3 rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center ${currentStepData.color}`}
                >
                  Continue
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Venue...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Create Venue
                    </>
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
