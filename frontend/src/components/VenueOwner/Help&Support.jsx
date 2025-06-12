import React, { useState } from "react"
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"

const VenueOwnerSupport = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const faqs = [
    {
      question: "How do I list my venue on the platform?",
      answer:
        "To list your venue, log in to your account, click on 'Add New Venue', and fill out the required information including venue details, photos, and availability.",
    },
    {
      question: "How do I manage my bookings?",
      answer:
        "You can manage your bookings through the 'Manage Bookings' page. Here, you can view pending and confirmed bookings, approve or reject requests, and communicate with customers.",
    },
    {
      question: "How do I set my venue's availability?",
      answer:
        "In your venue's settings, you can set regular opening hours and block out specific dates. You can also mark certain time slots as unavailable if needed.",
    },
    {
      question: "How do payouts work?",
      answer:
        "Payouts are processed automatically after each successful booking. The funds will be transferred to your linked bank account within 5-7 business days after the event date.",
    },
    {
      question: "What fees does the platform charge?",
      answer:
        "We charge a 10% commission on each booking. This fee covers payment processing, customer support, and platform maintenance. There are no upfront or monthly fees.",
    },
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    // Reset form after submission
    setFormData({ name: "", email: "", subject: "", message: "" })
    alert("Your support ticket has been submitted. We will get back to you soon!")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help & Support for Venue Owners</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg transition-all ease-in-out">
              <button
                className="flex justify-between items-center w-full p-4 text-left cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium ">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openFaq === index && (
                <div className="p-4 bg-gray-50">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <Mail className="w-6 h-6 mr-2 text-blue-500" />
            <span>support@venuebooking.com</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-6 h-6 mr-2 text-blue-500" />
            <span>+1 (555) 123-4567</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Submit a Support Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block mb-1 font-medium">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <MessageCircle className="w-5 h-5 inline-block mr-2" />
            Submit Ticket
          </button>
        </form>
      </section>
    </div>
  )
}

export default VenueOwnerSupport

