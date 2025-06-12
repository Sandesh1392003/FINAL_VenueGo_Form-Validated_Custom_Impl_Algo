import React, { useState } from "react"
import { Mail, ArrowRight, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD } from "../../components/Graphql/mutations/AuthGql";
import toast from "react-hot-toast";

export default function EmailVerificationPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [passwordReset] = useMutation(FORGOT_PASSWORD);
  
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).trim().toLowerCase());
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    const trimmedEmail = email.trim();
  
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
  
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
  
    if (isLoading) return; // Prevent duplicate submissions
    setIsLoading(true);
  
    try {
      const response = await passwordReset({
        variables: {
          email: trimmedEmail,
        },
      });
  
      const success = response.data?.passwordReset?.success;
      const message = response.data?.passwordReset?.message || "An unknown error occurred.";
  
      if (success) {
        toast.success(message);
        setIsEmailSent(true);
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.message || "Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-center text-sm text-gray-600">We'll send a verification link to your email address</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isEmailSent ? (
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-xl font-semibold text-gray-900">Verification Email Sent</h3>
              <p className="mt-2 text-gray-600">
                We've sent a verification code to {email}. Please check your inbox.
              </p>

            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

