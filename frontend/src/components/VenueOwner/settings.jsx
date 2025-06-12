"use client"

import { useContext, useState } from "react"
import { Lock, Save, Upload, User, AlertCircle } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import { useMutation } from "@apollo/client"
import { UPDATE_USER_DETAILS } from "../Graphql/mutations/updateUserGql"
import toast from "react-hot-toast"
import { useUploadImage } from "../Functions/UploadImage"

export default function SettingsPage() {
  const { user, refreshUser } = useContext(AuthContext)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    esewaId: user?.esewaId || "",
  })
  const { uploadImage } = useUploadImage();
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImg?.secure_url || null)
  const [errors, setErrors] = useState({})
  const [updateDetails] = useMutation(UPDATE_USER_DETAILS)

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
    const formErrors = {}

    // Validate personal info
    if (!personalInfo.fullName.trim()) {
      formErrors.fullName = "Full name is required"
    } else if (personalInfo.fullName.trim().length < 3) {
      formErrors.fullName = "Full name should be at least 3 characters"
    }

    // Validate email
    if (!personalInfo.email.trim()) {
      formErrors.email = "Email is required"
    } else if (!/^[a-zA-Z][a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(personalInfo.email)) {
      formErrors.email = "Invalid email format. Email should not start with a number."
    }

    // Validate phone
    if (!personalInfo.phone.trim()) {
      formErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(personalInfo.phone.replace(/\D/g, ""))) {
      formErrors.phone = "Phone number should be 10 digits"
    }

    // Validate esewaId if provided
    if (personalInfo.esewaId && !/^\d{10}$/.test(personalInfo.esewaId.replace(/\D/g, ""))) {
      formErrors.esewaId = "Esewa ID should be 10 digits"
    }

    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        let profileImgData = null;

        if (profileImage) {
          profileImgData = await toast.promise(
            uploadImage(
              profileImage,
              import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
              import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER
            ),
            {
              loading: "Uploading image...",
              success: "Image uploaded successfully! 🎉",
              error: "Failed to upload image. ❌",
            }
          );

          if (!profileImgData) {
            throw new Error("Failed to upload image");
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
            : null;

        const pfpImageWithoutTypename = extractImageData(profileImgData);

        const response = await toast.promise(
          updateDetails({
            variables: {
              input: {
                name: personalInfo.fullName,
                email: personalInfo.email,
                phone: personalInfo.phone,
                esewaId: personalInfo.esewaId,
                profileImg: pfpImageWithoutTypename,
              },
            },
          }),
          {
            loading: "Updating details...",
            success: "Updated successfully! 🎉",
            error: "Failed to update details. ❌",
          }
        );

        const { success } = response.data?.updateUserDetails;

        if (!success) {
          return toast.error("Failed to update details");
        }

        refreshUser();
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      toast.error("Please fix the errors in the form");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview || "/placeholder.svg"}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
            </div>

            <div className="flex flex-col items-center">
              <label
                htmlFor="profile-image"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {errors.profileImage && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.profileImage}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Allowed formats: JPEG, PNG, GIF. Max size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.fullName && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.email && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Email should not start with a number</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={personalInfo.phone}
                onChange={handlePersonalInfoChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.phone && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">10-digit phone number</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="esewaId" className="block text-sm font-medium text-gray-700">
                Esewa Number
              </label>
              <input
                type="tel"
                name="esewaId"
                id="esewaId"
                value={personalInfo.esewaId}
                onChange={handlePersonalInfoChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.esewaId ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.esewaId && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.esewaId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </h2>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Change Password
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
