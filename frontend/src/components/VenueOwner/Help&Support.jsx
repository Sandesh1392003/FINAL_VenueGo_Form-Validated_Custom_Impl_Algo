"use client"

import { useState } from "react"
import { Mail, Phone, MessageCircle, ChevronDown, ChevronUp, HelpCircle, LifeBuoy, FileText, Clock } from "lucide-react"

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
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
    alert("Your support ticket has been submitted. We will get back to you soon!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <LifeBuoy className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Help & Support for Venue Owners</h1>
        </div>
        <p className="text-slate-600 max-w-3xl">
          Get the help you need to maximize your venue's potential. We're here to support your success every step of the
          way.
        </p>
      </div>

      {/* Support Options */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Email Support */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
            <p className="text-slate-600 text-sm mb-3">Get detailed help via email</p>
            <a
              href="mailto:support@venuebooking.com"
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              support@venuebooking.com
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Phone Support</h3>
            <p className="text-slate-600 text-sm mb-3">Speak with our team directly</p>
            <a href="tel:+15551234567" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
              +1 (555) 123-4567
            </a>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Documentation</h3>
            <p className="text-slate-600 text-sm mb-3">Browse our help guides</p>
            <a href="#" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Support Hours Notice */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Support Hours</h3>
              <p className="text-slate-600">Our support team is available Monday to Friday, 9 AM to 6 PM EST.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">
        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-purple-100">
                <button
                  className="flex justify-between items-center w-full p-4 text-left cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-purple-50 border-t border-purple-100 rounded-b-xl">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Submit a Support Ticket</h2>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block mb-1 text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1 text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block mb-1 text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-1 text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your issue"
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueOwnerSupport
