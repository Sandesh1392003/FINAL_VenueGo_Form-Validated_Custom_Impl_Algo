"use client"

import { useEffect, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { VERIFY_PAYMENT } from "./Graphql/mutations/paymentGql"
import { CheckCircle, AlertCircle, Loader, CreditCard, Calendar, Home } from "lucide-react"
import AnotherLoader from "../pages/common/AnotherLoader"

const animationStyles = `
  @keyframes scaleUp {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes checkPop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-scale-up {
    animation: scaleUp 0.5s ease-out forwards;
  }
  .animate-check-pop {
    animation: checkPop 0.5s ease-out 0.2s forwards;
  }
`

const PaymentSuccess = () => {
  const location = useLocation()
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [verificationError, setVerificationError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [verifyPayment] = useMutation(VERIFY_PAYMENT)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const encodedData = searchParams.get("data")

    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData))
        setPaymentDetails(decodedData)

        verifyPayment({
          variables: {
            transactionId: decodedData.transaction_uuid,
          },
          fetchPolicy: 'network-only'
        })
          .then((res) => {
            if (!res.data.verifyPayment.success) {
              setVerificationError("Payment verification failed.")
            }
            setIsLoading(false)
          })
          .catch((err) => {
            console.error("Verification Error:", err)
            setVerificationError("Failed to verify payment.")
            setIsLoading(false)
          })
      } catch (error) {
        console.error("Error decoding payment data:", error)
        setVerificationError("Invalid payment response.")
        setIsLoading(false)
      }
    } else {
      setVerificationError("No payment data received.")
      setIsLoading(false)
    }
  }, [location.search, verifyPayment])

  if (isLoading) return <AnotherLoader loading_text={"Verifying payment..."}/>

  if (verificationError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-center text-red-700 mb-4">Payment Verification Failed</h2>
        <p className="text-center text-gray-600 mb-6">{verificationError}</p>
        <Link
          to="/Home"
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <Home className="inline-block mr-2" />
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-4">
      <style>{animationStyles}</style>
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full animate-scale-up"></div>
            <CheckCircle className="w-16 h-16 text-green-500 absolute top-0 left-0 animate-check-pop" />
          </div>
        </div>
      <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Payment Successful!</h2>

      {paymentDetails && (
        <div className="space-y-4">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Transaction ID:</span> {paymentDetails.transaction_uuid}
            </p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Amount:</span> NPR {paymentDetails.total_amount}
            </p>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            <p>
              <span className="font-semibold">Status:</span> {paymentDetails.status}
            </p>
          </div>
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Transaction Code:</span> {paymentDetails.transaction_code}
            </p>
          </div>
        </div>
      )}

      <Link
        to="/Home"
        className="block w-full text-center mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        <Home className="inline-block mr-2" />
        Back to Home
      </Link>
    </div>
  )
}

export default PaymentSuccess

