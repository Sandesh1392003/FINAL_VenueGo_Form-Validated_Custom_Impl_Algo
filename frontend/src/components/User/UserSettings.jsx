"use client"

import { useContext, useState } from "react"
import { Save, User, Lock, Upload, AlertCircle, Camera, Mail, Phone, Shield, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import toast from "react-hot-toast"
import { useUploadImage } from "../Functions/UploadImage"
import { useMutation } from "@apollo/client"
import { UPDATE_USER_DETAILS } from "../Graphql/mutations/UserGql"

const UserSettingsPage = () => {
  const { user, loading, refreshUser } = useContext(AuthContext)
  const { uploadImage } = useUploadImage()
  const navigate = useNavigate()

  const [updateUserDetails] = useMutation(UPDATE_USER_DETAILS)

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [profileImage, setProfileImage] = useState(user?.profileImg?.secure_url || null)
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImg?.secure_url || null)
  const [errors, setErrors] = useState({})

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo({ ...personalInfo, [name]: value })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    // Clear previous errors
    setErrors({ ...errors, profileImage: null })

    if (!file) return

    // Validate file is an image
    if (!file.type.match("image.*")) {
      setErrors({ ...errors, profileImage: "Please select an image file (JPEG, PNG, etc.)" })
      e.target.value = null // Reset the input
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: "Image size should be less than 5MB" })
      e.target.value = null // Reset the input
      return
    }

    // If validation passes, set the image
    setProfileImage(file)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate name
    if (!personalInfo.name || personalInfo.name.trim() === "") {
      newErrors.name = "Name is required"
    }

    // Validate email
    if (!personalInfo.email || personalInfo.email.trim() === "") {
      newErrors.email = "Email is required"
    } else if (!/^[a-zA-Z][a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(personalInfo.email)) {
      newErrors.email = "Invalid email format. Email should not start with a number."
    }

    // Validate phone
    if (!personalInfo.phone || personalInfo.phone.trim() === "") {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(personalInfo.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number should be 10 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      toast
        .promise(
          (async () => {
            try {
              let profileImgData = null

              if (profileImage) {
                profileImgData = await uploadImage(
                  profileImage,
                  import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
                  import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER,
                )

                if (!profileImgData) {
                  throw new Error("Failed to upload image")
                }
              }

              const extractImageData = (imageData) =>
                imageData
                  ? {
                    public_id: imageData.public_id,
                    secure_url: imageData.secure_url,
                    asset_id: imageData.asset_id,
                    version: Number.parseInt(imageData.version, 10),
                    format: imageData.format,
                    width: Number.parseInt(imageData.width, 10),
                    height: Number.parseInt(imageData.height, 10),
                    created_at: imageData.created_at,
                  }
                  : null

              const pfpImageWithoutTypename = extractImageData(profileImgData)

              const response = await updateUserDetails({
                variables: {
                  input: {
                    name: personalInfo.name,
                    email: personalInfo.email,
                    phone: personalInfo.phone,
                    profileImg: pfpImageWithoutTypename,
                  },
                },
              })

              const { success, message } = response.data?.updateUserDetails

              if (!success) throw new Error("Failed to update, try again later")
            } catch (error) {
              console.error("Update error:", error)
              throw error
            }
          })(),
          {
            loading: "Updating...",
            success: "Updated successfully!",
            error: "Failed to update. Please try again.",
          },
        )
        .then(() => {
          refreshUser()
        })
    } else {
      console.log("Form has validation errors")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-600">Manage your personal information and preferences</p>
        </div>

        {/* Status Alert */}
        {user?.roleApprovalStatus === "PENDING" && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Account Under Review</h3>
                <p className="text-yellow-700">Your account is currently being reviewed by our team.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Camera className="mr-3 text-purple-600" />
                Profile Picture
              </h2>
              <p className="text-slate-600 mt-1">Upload a professional photo for your profile</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile Image Display */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-xl">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview || "/placeholder.svg"}
                        alt={personalInfo.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-purple-400" />
                    )}
                  </div>
                  {user?.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 text-center lg:text-left">
                  <label
                    htmlFor="profile-image"
                    className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Upload className="h-5 w-5" />
                    Upload New Photo
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {errors.profileImage && (
                    <div className="mt-3 flex items-center justify-center lg:justify-start text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.profileImage}
                    </div>
                  )}

                  <p className="mt-3 text-sm text-slate-500">Supported formats: JPEG, PNG, GIF • Maximum size: 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <User className="mr-3 text-purple-600" />
                Personal Information
              </h2>
              <p className="text-slate-600 mt-1">Update your personal details and contact information</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-purple-300"
                        }`}
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-purple-600" />
                  </div>
                  {errors.name && (
                    <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${errors.email ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-purple-300"
                        }`}
                      placeholder="Enter your email address"
                    />
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-purple-600" />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.email}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    💡 Email should not start with a number
                  </p>
                </div>

                {/* Phone Number */}
                <div className="lg:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative max-w-md">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${errors.phone ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-purple-300"
                        }`}
                      placeholder="Enter your phone number"
                    />
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-purple-600" />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200 max-w-md">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Shield className="mr-3 text-purple-600" />
                Security & Privacy
              </h2>
              <p className="text-slate-600 mt-1">Manage your account security settings</p>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200">
                <div className="flex items-center">
                  <Lock className="h-6 w-6 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Password</h3>
                    <p className="text-sm text-slate-600">Last updated 30 days ago</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300 font-semibold"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserSettingsPage
