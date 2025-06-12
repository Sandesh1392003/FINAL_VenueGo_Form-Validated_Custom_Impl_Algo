import {
  Search,
  Calendar,
  CreditCard,
  Star,
  CheckCircle,
  Users,
  Music,
  Utensils,
  Camera,
  Clock,
  Sparkles,
  ArrowRightIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  HeartIcon,
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
              <span className="text-purple-200 text-sm font-medium">✨ Simple. Seamless. Spectacular.</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              How VenueGo
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Works
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Your all-in-one platform for planning and managing events with ease. From venue selection to service
              coordination, we've revolutionized event planning in Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        {/* Steps Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Plan Your Event in 6 Simple Steps</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              From concept to celebration, our streamlined process makes event planning effortless and enjoyable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <StepCard
              icon={<Search className="w-12 h-12 text-purple-600" />}
              title="1. Find the Perfect Venue"
              description="Browse our curated selection of venues and filter by location, capacity, price, and event type to find your ideal match."
              gradient="from-purple-500 to-purple-600"
            />
            <StepCard
              icon={<Sparkles className="w-12 h-12 text-purple-600" />}
              title="2. Select Event Services"
              description="Choose from a variety of services like catering, photography, DJ, and more to enhance your event experience."
              gradient="from-indigo-500 to-purple-600"
            />
            <StepCard
              icon={<Calendar className="w-12 h-12 text-purple-600" />}
              title="3. Check Availability"
              description="View real-time availability for venues and services, then select your preferred date and time slot."
              gradient="from-purple-600 to-pink-600"
            />
            <StepCard
              icon={<CreditCard className="w-12 h-12 text-purple-600" />}
              title="4. Book and Pay Securely"
              description="Complete your booking with our secure payment system. Manage all your vendors in one transaction."
              gradient="from-pink-500 to-rose-600"
            />
            <StepCard
              icon={<Clock className="w-12 h-12 text-purple-600" />}
              title="5. Coordinate Your Event"
              description="Use our platform to communicate with venue owners and service providers to ensure everything runs smoothly."
              gradient="from-violet-500 to-purple-600"
            />
            <StepCard
              icon={<CheckCircle className="w-12 h-12 text-purple-600" />}
              title="6. Enjoy and Review"
              description="Host your perfect event and share your experience by leaving reviews for venues and services."
              gradient="from-blue-500 to-indigo-600"
            />
          </div>
        </section>

        {/* Services Section */}

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Why Choose VenueGo?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We've revolutionized event planning with cutting-edge technology, verified providers, and unmatched
              customer service.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8 text-purple-600" />}
              title="All-in-One Platform"
              description="Manage venues, services, and vendors in one place, simplifying your event planning process."
            />
            <FeatureCard
              icon={<TrendingUpIcon className="w-8 h-8 text-purple-600" />}
              title="Verified Providers"
              description="All venues and service providers are thoroughly vetted to ensure quality and reliability."
            />
            <FeatureCard
              icon={<HeartIcon className="w-8 h-8 text-purple-600" />}
              title="Transparent Pricing"
              description="Clear pricing with no hidden fees. See exactly what you're paying for each service."
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8 text-purple-600" />}
              title="Real-Time Coordination"
              description="Communicate with all your vendors through our platform to keep everyone on the same page."
            />
            <FeatureCard
              icon={<TrendingUpIcon className="w-8 h-8 text-purple-600" />}
              title="Customizable Packages"
              description="Mix and match services to create the perfect event package tailored to your needs."
            />
            <FeatureCard
              icon={<HeartIcon className="w-8 h-8 text-purple-600" />}
              title="Dedicated Support"
              description="Our event specialists are available to help you with any questions or issues that arise."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-3xl -mx-6 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Create Your
              <span className="block text-purple-200">Perfect Event?</span>
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Start planning today and transform your vision into an unforgettable experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                Explore Venues
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-purple-300 text-purple-100 hover:bg-purple-300 hover:text-purple-900 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">What Our Customers Say</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real stories from satisfied customers who made their events extraordinary with VenueGo.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="VenueGo made planning our corporate conference so much easier. We found the perfect venue and coordinated all our vendors in one place!"
              author="Priya Sharma"
              role="Event Manager"
              company="Tech Solutions Nepal"
              rating={5}
            />
            <TestimonialCard
              quote="The ability to book both our wedding venue and catering service together saved us so much time. Highly recommend for any couple planning their big day."
              author="Rahul and Meera"
              role="Newlyweds"
              company="Kathmandu"
              rating={5}
            />
            <TestimonialCard
              quote="As someone who organizes events frequently, I appreciate how VenueGo streamlines the entire process. Their customer support is also exceptional."
              author="Vikram Mehta"
              role="Corporate Planner"
              company="Himalayan Events"
              rating={4}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StepCard({ icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>
      <div className="relative p-8 flex flex-col items-center text-center">
        <div className="mb-6 p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ServiceCard({ icon, title, description, gradient }) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center mr-4`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
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

function TestimonialCard({ quote, author, role, company, rating }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
      <div className="flex items-center mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
      <blockquote className="text-slate-700 text-lg leading-relaxed italic mb-6">"{quote}"</blockquote>
      <div>
        <p className="font-bold text-slate-900 text-lg">{author}</p>
        <p className="text-purple-600 font-medium">{role}</p>
        <p className="text-slate-500 text-sm">{company}</p>
      </div>
    </div>
  )
}
