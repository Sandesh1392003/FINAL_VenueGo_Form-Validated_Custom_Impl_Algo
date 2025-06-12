"use client"

import { useEffect, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react"

const PaymentFailed = () => {
  const location = useLocation()
  const [errorDetails, setErrorDetails] = useState(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const encodedData = searchParams.get("error")

    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData))
        setErrorDetails(decodedData)
      } catch (error) {
        console.error("Error decoding error data:", error)
        setErrorDetails({ message: "An unknown error occurred" })
      }
    } else {
      setErrorDetails({ message: "No error details available" })
    }
  }, [location.search])

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center text-red-500 mb-4">
        <AlertTriangle className="w-16 h-16" />
      </div>
      <h2 className="text-2xl font-bold text-center text-red-700 mb-4">Payment Failed</h2>

      {errorDetails && <p className="text-center text-gray-600 mb-6">{errorDetails.message}</p>}

      <div className="space-y-4">
        <Link
          to="/book-now"
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <RefreshCw className="inline-block mr-2" />
          Try Again
        </Link>

        <Link
          to="#"
          className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <Mail className="inline-block mr-2" />
          Contact Support
        </Link>

        <Link
          to="/Home"
          className="block w-full text-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
        >
          <Home className="inline-block mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default PaymentFailed

