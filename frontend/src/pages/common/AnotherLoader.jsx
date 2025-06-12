import { Loader } from 'lucide-react'
import React from 'react'

const AnotherLoader = ({loading_text}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <Loader className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="mt-4 text-lg font-semibold text-gray-700">{loading_text}</p>
  </div>
  )
}

export default AnotherLoader
