"use client"

import { useMutation } from "@apollo/client"
import { useState, useEffect } from "react"
import { BOOK_VENUE } from "./Graphql/mutations/bookVenueGql"
import { GEN_SIGNATURE, INITIATE_PAYMENT } from "./Graphql/mutations/paymentGql"
import Loader from "../pages/common/Loader"
import { toast } from "react-hot-toast"
import { CreditCard, AlertCircle } from "lucide-react"

const EsewaPaymentForm = ({ venue, date, start, end, selectedServices = [], totalAmount, disabled = false }) => {
  const [formData, setFormData] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isFormValid, setIsFormValid] = useState(false)

  const [bookVenue, { loading: bookingLoading }] = useMutation(BOOK_VENUE)
  const [initiatePayment, { loading: iLoading }] = useMutation(INITIATE_PAYMENT)
  const [genSignature, { loading: sLoading }] = useMutation(GEN_SIGNATURE)

  // Validate form whenever dependencies change
  useEffect(() => {
    setIsFormValid(!!venue && !!date && !!start && !!end && totalAmount > 0)
  }, [venue, date, start, end, totalAmount])

  if (bookingLoading || iLoading || sLoading) return <Loader />

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear any previous errors
    setErrorMessage(null)

    // Validate required fields
    if (!venue || !date || !start || !end) {
      setErrorMessage("Please fill in all required booking details")
      return
    }

    if (totalAmount <= 0) {
      setErrorMessage("Invalid booking amount")
      return
    }

    await toast.promise(
      (async () => {
        try {
          // Step 1: Book the venue with selected services
          const bookingRes = await bookVenue({
            variables: {
              input: {
                venue,
                date,
                start,
                end,
                selectedServices, // Include selected services in the booking
              },
            },
          })

          const { id: bookingId } = bookingRes.data?.bookVenue

          // Step 2: Initiate Payment
          const initiatePaymentRes = await initiatePayment({
            variables: { bookingId, amount: totalAmount },
          })

          const { transactionId } = initiatePaymentRes.data?.initiatePayment

          // Step 3: Generate Signature
          const getSignatureRes = await genSignature({
            variables: {
              total_amount: totalAmount,
              transaction_uuid: transactionId,
              product_code: import.meta.env.VITE_PAYMENT_PRODUCT_CODE,
            },
          })

          const { signature, signed_field_names } = getSignatureRes.data?.generateSignature

          // Step 4: Prepare Form Data
          const newFormData = {
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            transaction_uuid: transactionId,
            product_code: import.meta.env.VITE_PAYMENT_PRODUCT_CODE,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: import.meta.env.VITE_PAYMENT_SUCCESS_URL,
            failure_url: import.meta.env.VITE_PAYMENT_FAILURE_URL,
            signed_field_names,
            signature,
          }

          setFormData(newFormData)

          // Wait for state update before submitting
          setTimeout(() => {
            const form = document.getElementById("esewa-form")
            if (form) form.submit()
          }, 100)
        } catch (err) {
          throw new Error(err.message || "Booking failed! Please try again.")
        }
      })(),
      {
        loading: "Processing your booking...",
        success: "Redirecting to payment...",
        error: (err) => err.message, // Show backend error message
      },
    )
  }

  return (
    <div className="mt-6">
      <form
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
        id="esewa-form"
        onSubmit={handleSubmit}
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {formData &&
          Object.keys(formData).map((key) => (
            <input key={key} type="hidden" name={key} value={formData[key]} readOnly required />
          ))}

        <button
          type="submit"
          disabled={!isFormValid || disabled || bookingLoading || iLoading || sLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
            isFormValid && !disabled && !bookingLoading && !iLoading && !sLoading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <CreditCard className="mr-2" size={20} />
          {totalAmount > 0 ? `Proceed to Payment (Rs. ${totalAmount})` : "Proceed to Payment"}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2 text-center">
        You'll be redirected to eSewa to complete your payment securely.
      </p>
    </div>
  )
}

export default EsewaPaymentForm

