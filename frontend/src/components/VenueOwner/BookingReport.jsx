"use client"

import { useQuery } from "@apollo/client"
import { useParams } from "react-router-dom"
import {
    Calendar,
    MapPin,
    User,
    Phone,
    Mail,
    Clock,
    FileText,
    PrinterIcon as Print,
    ImageIcon,
    CreditCard,
    CheckCircle,
    Share,
} from "lucide-react"
import { MY_BOOKINGS } from "../../components/Graphql/query/meGql"
import { convertToDate } from "../../components/Functions/calc"

export default function BookingReport({ companyInfo: propCompanyInfo }) {
    const { id: bookingID } = useParams()

    const { data, loading, error } = useQuery(MY_BOOKINGS, {
        variables: { id: bookingID },
    })

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    <p className="text-slate-600 text-sm">Loading...</p>
                </div>
            </div>
        )

    if (error)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-red-600 font-semibold text-sm">Error loading booking report.</p>
                </div>
            </div>
        )

    if (!data || !data.booking)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-slate-600 text-sm">No booking found.</p>
                </div>
            </div>
        )

    const booking = data.booking

    // Default company info if not provided
    const companyInfo = propCompanyInfo || {
        name: "VenueGo",
        address: "123 Business Street, City, State 12345",
        phone: "9861951616",
        email: "contact@VenueGo.com",
        website: "www.VenueGo.com",
    }

    const formatCurrency = (amount) => {
        if (typeof amount !== "number") return "-"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NPR",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const calculateDuration = () => {
        if (!booking.timeslots || booking.timeslots.length === 0) return 0
        const startTime = booking.timeslots[0].start
        const endTime = booking.timeslots[booking.timeslots.length - 1].end
        const start = new Date(`2000-01-01 ${startTime}`)
        const end = new Date(`2000-01-01 ${endTime}`)
        return (end - start) / (1000 * 60 * 60) // Convert to hours
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
            case "PAID":
                return "bg-green-100 text-green-700 border-green-300"
            case "PENDING":
                return "bg-yellow-100 text-yellow-700 border-yellow-300"
            case "REJECTED":
            case "CANCELLED":
            case "FAILED":
                return "bg-red-100 text-red-700 border-red-300"
            case "NO_SHOW":
                return "bg-orange-100 text-orange-700 border-orange-300"
            default:
                return "bg-purple-100 text-purple-700 border-purple-300"
        }
    }

    const formatLocation = (location) => {
        if (!location) return ""
        const parts = []
        if (location.street) parts.push(location.street)
        if (location.city) parts.push(location.city)
        if (location.province) parts.push(location.province)
        if (location.zipCode) parts.push(location.zipCode)
        return parts.join(", ")
    }

    const handlePrint = () => {
        window.print()
    }

    const duration = calculateDuration()
    const basePricePerHour = booking.venue?.basePricePerHour || 0
    const baseAmount = basePricePerHour * duration

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 print:bg-white">
            {/* Top Navigation Bar */}
            <div className="bg-white shadow-xl border-b border-purple-100 print:shadow-none print:border-b-2 print:border-purple-600">
                <div className="max-w-6xl mx-auto px-4 py-3 print:py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-2 print:p-1">
                                <FileText className="w-5 h-5 text-white print:w-4 print:h-4" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 print:text-lg">{companyInfo.name}</h1>
                                <p className="text-slate-600 text-sm print:text-xs">Report #{booking.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <button className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-indigo-200 transform hover:scale-105 transition-all duration-300 text-sm">
                                <Share className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-300 text-sm"
                            >
                                <Print className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-4 print:py-2">
                {/* Status Cards Row */}
                <div className="grid grid-cols-3 gap-3 mb-4 print:mb-3">
                    <div className="bg-white rounded-xl p-3 shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                            <div>
                                <p className="text-slate-600 text-xs">Booking</p>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                                    {booking.bookingStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            <div>
                                <p className="text-slate-600 text-xs">Payment</p>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(booking.paymentStatus)}`}>
                                    {booking.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <div>
                                <p className="text-slate-600 text-xs">Total</p>
                                <p className="text-lg font-bold text-slate-900 print:text-base">{formatCurrency(booking.totalPrice)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 print:gap-3">
                    {/* Left Column - Customer & Event Info */}
                    <div className="xl:col-span-2 space-y-4 print:space-y-3">
                        {/* Customer & Venue Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-3">
                            {/* Customer Widget */}
                            <div className="bg-white rounded-xl shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-3 print:p-2">
                                    <div className="flex items-center gap-2 text-white">
                                        <User className="w-4 h-4" />
                                        <h3 className="text-sm font-bold">Customer</h3>
                                    </div>
                                </div>
                                <div className="p-3 space-y-2 print:p-2 print:space-y-1">
                                    <div className="text-sm font-bold text-slate-900">{booking.user?.name}</div>
                                    {booking.user?.email && (
                                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                                            <Mail className="w-3 h-3 text-purple-600" />
                                            <span>{booking.user.email}</span>
                                        </div>
                                    )}
                                    {(booking.phone || booking.user?.phone) && (
                                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                                            <Phone className="w-3 h-3 text-purple-600" />
                                            <span>{booking.phone || booking.user?.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Venue Widget */}
                            <div className="bg-white rounded-xl shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-3 print:p-2">
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-4 h-4" />
                                        <h3 className="text-sm font-bold">Venue</h3>
                                    </div>
                                </div>
                                <div className="p-3 space-y-2 print:p-2 print:space-y-1">
                                    <div className="text-sm font-bold text-slate-900">{booking.venue?.name}</div>
                                    <div className="text-slate-600 text-xs">{formatLocation(booking.venue?.location)}</div>
                                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                                        <Calendar className="w-3 h-3 text-purple-600" />
                                        <span>{convertToDate(booking.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                                        <Clock className="w-3 h-3 text-purple-600" />
                                        <span>
                                            {booking.timeslots?.[0]?.start} - {booking.timeslots?.[booking.timeslots.length - 1]?.end}
                                            {duration > 0 && <span className="ml-1 text-purple-600 font-semibold">({duration}h)</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Image - Smaller */}
                        {booking.image?.secure_url && (
                            <div className="bg-white rounded-xl shadow-xl border border-purple-100 p-3 transform hover:scale-105 transition-all duration-300 print:hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <ImageIcon className="w-4 h-4 text-purple-600" />
                                    <h3 className="text-sm font-bold text-slate-900">Preview</h3>
                                </div>
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={booking.image.secure_url || "/placeholder.svg"}
                                        alt="Booking"
                                        className="w-full h-32 object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Services Compact Grid */}
                        {booking.selectedServices && booking.selectedServices.length > 0 && (
                            <div className="bg-white rounded-xl shadow-xl border border-purple-100 p-3 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Services</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {booking.selectedServices.map((service, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-100"
                                        >
                                            <div className="font-semibold text-slate-900 text-xs">{service.serviceId.name}</div>
                                            <div className="text-xs text-slate-600">ID: {service.serviceId.id}</div>
                                            <div className="text-sm font-bold text-purple-600">{formatCurrency(service.servicePrice)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Billing Summary */}
                    <div className="space-y-4 print:space-y-3">
                        {/* Company Info Card - Compact */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 print:shadow-none print:p-3">
                            <div className="text-center">
                                <h2 className="text-lg font-bold mb-2 print:text-base print:mb-1">Invoice Details</h2>
                                <div className="space-y-1 text-purple-100 text-xs">
                                    <div>{companyInfo.address}</div>
                                    <div>
                                        {companyInfo.phone} • {companyInfo.email}
                                    </div>
                                    {companyInfo.website && <div className="font-semibold">{companyInfo.website}</div>}
                                </div>
                                <div className="mt-3 pt-3 border-t border-purple-400 print:mt-2 print:pt-2">
                                    <div className="text-xs">Issued: {convertToDate(booking.createdAt || booking.date)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Breakdown - Compact */}
                        <div className="bg-white rounded-xl shadow-xl border border-purple-100 overflow-hidden transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-3 print:p-2">
                                <h3 className="text-sm font-bold text-slate-900">Billing Summary</h3>
                            </div>
                            <div className="p-3 space-y-2 print:p-2 print:space-y-1">
                                <div className="flex justify-between items-center py-1 border-b border-purple-100">
                                    <div>
                                        <div className="font-semibold text-slate-900 text-xs">Venue Rental</div>
                                        <div className="text-xs text-slate-600">
                                            {duration}h × {formatCurrency(basePricePerHour)}
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm">{formatCurrency(baseAmount)}</div>
                                </div>

                                {booking.selectedServices?.map((service, index) => (
                                    <div key={index} className="flex justify-between items-center py-1 border-b border-purple-100">
                                        <div>
                                            <div className="font-semibold text-slate-900 text-xs">{service.serviceId.name}</div>
                                            <div className="text-xs text-slate-600">Service</div>
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">{formatCurrency(service.servicePrice)}</div>
                                    </div>
                                ))}

                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-3 text-white print:p-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold">Total</span>
                                        <span className="text-lg font-bold print:text-base">{formatCurrency(booking.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes - Compact */}
                        {booking.additionalNotes && (
                            <div className="bg-white rounded-xl shadow-xl border border-purple-100 p-3 transform hover:scale-105 transition-all duration-300 print:shadow-none print:border print:border-purple-300">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Notes</h3>
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2 text-slate-600 border border-purple-100 text-xs">
                                    {booking.additionalNotes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Compact Footer */}
            <div className="bg-white border-t border-purple-200 mt-4 print:mt-2">
                <div className="max-w-6xl mx-auto px-4 py-3 text-center print:py-2">
                    <div className="text-sm font-bold text-slate-900 mb-1 print:text-xs">
                        Thank you for choosing {companyInfo.name}!
                    </div>
                    <div className="text-slate-600 text-xs">
                        Questions? <span className="text-purple-600 font-semibold">{companyInfo.email}</span> •{" "}
                        <span className="text-purple-600 font-semibold">{companyInfo.phone}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
