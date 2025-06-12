"use client"

import { useContext, useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  StarIcon,
  CameraIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  HeartIcon,
  BuildingIcon,
  GlobeIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { VENUES } from "../../components/Graphql/query/venuesGql"
import Loader from "../common/Loader"
import { useQuery } from "@apollo/client"
import { AuthContext } from "../../middleware/AuthContext"
import getOptimizedCloudinaryUrl from "../../components/Functions/OptimizedImageUrl"

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const { data, error, loading } = useQuery(VENUES)

  useEffect(() => {
    if (data?.venues) {
      setVenues(data.venues)
    }
  }, [data])

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative container mx-auto px-6 py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                <span className="text-purple-200 text-sm font-medium">🎉 Nepal's Premier Event Platform</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Where Events
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Come to Life
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Connect with premium venues, trusted vendors, and seamless booking experiences. From intimate gatherings
                to grand celebrations across Nepal.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/venues")}
                className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
              >
                <BuildingIcon className="w-5 h-5" />
                Explore Venues
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-slate-400 text-slate-300 hover:bg-white hover:text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Premium Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-slate-600 font-medium">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">7</div>
              <div className="text-slate-600 font-medium">Provinces Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-slate-600 font-medium">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Why Industry Leaders Choose Us</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              We've revolutionized event planning in Nepal with cutting-edge technology, verified venues, and unmatched
              customer service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8 text-purple-600" />}
              title="Verified Quality"
              description="Every venue undergoes rigorous quality checks and verification processes to ensure premium standards."
            />
            <FeatureCard
              icon={<TrendingUpIcon className="w-8 h-8 text-purple-600" />}
              title="Smart Analytics"
              description="Data-driven insights help you make informed decisions with real-time availability and pricing."
            />
            <FeatureCard
              icon={<HeartIcon className="w-8 h-8 text-purple-600" />}
              title="Dedicated Support"
              description="24/7 expert support team ensures your event planning journey is smooth and stress-free."
            />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Complete Event Ecosystem</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From venue selection to post-event analytics, we provide end-to-end solutions for every aspect of your
              event planning needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<BuildingIcon className="w-10 h-10 text-white" />}
              title="Premium Venues"
              description="Curated selection of verified venues across all major cities and provinces in Nepal."
              gradient="from-purple-500 to-purple-600"
            />
            <ServiceCard
              icon={<UsersIcon className="w-10 h-10 text-white" />}
              title="Vendor Network"
              description="Access to trusted caterers, decorators, photographers, and entertainment professionals."
              gradient="from-indigo-500 to-indigo-600"
            />
            <ServiceCard
              icon={<CalendarDaysIcon className="w-10 h-10 text-white" />}
              title="Smart Scheduling"
              description="AI-powered scheduling system that optimizes availability and prevents double bookings."
              gradient="from-purple-600 to-pink-600"
            />
            <ServiceCard
              icon={<CameraIcon className="w-10 h-10 text-white" />}
              title="Media Services"
              description="Professional photography, videography, and live streaming services for your events."
              gradient="from-pink-500 to-rose-600"
            />
            <ServiceCard
              icon={<ClockIcon className="w-10 h-10 text-white" />}
              title="Event Management"
              description="Full-service event coordination from planning to execution with dedicated managers."
              gradient="from-violet-500 to-purple-600"
            />
            <ServiceCard
              icon={<GlobeIcon className="w-10 h-10 text-white" />}
              title="Digital Solutions"
              description="QR-based check-ins, digital invitations, and real-time event analytics dashboard."
              gradient="from-blue-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Handpicked Venues</h2>
              <p className="text-xl text-slate-600">
                Discover exceptional spaces that have hosted Nepal's most memorable events
              </p>
            </div>
            <button
              onClick={() => navigate("/venues")}
              className="mt-6 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
            >
              View All Venues
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Venue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.slice(0, 6).map((venue, index) => (
              <ProfessionalVenueCard key={venue.id || index} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by Event Professionals</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what industry leaders and satisfied clients say about their experience with our platform
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="VenueGo has transformed how we plan corporate events. The platform's efficiency and venue quality are unmatched in Nepal."
              author="Rajesh Shrestha"
              role="Corporate Event Director"
              company="Himalayan Enterprises"
              image="https://picsum.photos/id/1005/200/300"
              rating={5}
            />
            <TestimonialCard
              quote="From venue selection to vendor coordination, everything was seamless. Our wedding was exactly what we dreamed of."
              author="Priya Maharjan"
              role="Bride"
              company="Kathmandu"
              image="https://picsum.photos/id/237/200/300"
              rating={5}
            />
            <TestimonialCard
              quote="The analytics and booking system have streamlined our venue management operations significantly. Highly recommended."
              author="Amit Gurung"
              role="Venue Owner"
              company="Pokhara Resort"
              image="https://picsum.photos/id/342/200/300"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Ready to Elevate Your
              <span className="block text-purple-200">Event Experience?</span>
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Join thousands of event planners who trust us to deliver exceptional experiences. Start planning your next
              event today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/SignUp")}
                className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Start Planning Now
              </button>
              <button className="border-2 border-purple-300 text-purple-100 hover:bg-purple-300 hover:text-purple-900 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ServiceCard({ icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>
      <div className="relative p-8">
        <div className={`bg-gradient-to-br ${gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ProfessionalVenueCard({ venue }) {
  const averageRating = venue.reviews?.length
    ? venue.reviews.reduce((acc, review) => acc + review.rating, 0) / venue.reviews.length
    : 0

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
      <div className="relative overflow-hidden h-64">
        <img
          src={venue.image?.secure_url || "/placeholder.svg?height=300&width=400"}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        {averageRating > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-bold text-slate-900">{averageRating.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="w-4 h-4" />
            <span>
              {venue.location?.city}, {venue.location?.province}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
          {venue.name}
        </h3>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-purple-600">
            NPR {venue.basePricePerHour}
            <span className="text-sm font-normal text-slate-500">/hour</span>
          </div>
          <div className="text-slate-600 text-sm">Up to {venue.capacity} guests</div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {venue.categories?.slice(0, 2).map((category, index) => (
            <span key={index} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
              {category.replace("_", " ")}
            </span>
          ))}
        </div>
        <button className="w-full bg-slate-900 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300">
          View Details
        </button>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, role, company, image, rating }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
      <div className="flex items-center mb-6">
        <img
          src={getOptimizedCloudinaryUrl(image) || "https://picsum.photos/200/300"}
          alt={author}
          className="w-16 h-16 rounded-full border-3 border-purple-500 mr-4"
        />
        <div>
          <h4 className="font-bold text-white text-lg">{author}</h4>
          <p className="text-purple-300 font-medium">{role}</p>
          <p className="text-slate-400 text-sm">{company}</p>
        </div>
      </div>
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-slate-300 text-lg leading-relaxed italic">"{quote}"</blockquote>
    </div>
  )
}
