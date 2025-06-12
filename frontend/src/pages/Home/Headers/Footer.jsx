import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                VenueGo
              </Link>
              <p className="mt-2 text-slate-400">
                Nepal's premier platform for discovering and booking exceptional event venues and services.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-purple-400 mt-1 mr-3 flex-shrink-0" />
                <p className="text-slate-300">Thamel, Kathmandu 44600, Nepal</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                <p className="text-slate-300">+977 1-4123456</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                <p className="text-slate-300">contact@venuego.com</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/venues" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-300 hover:text-purple-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services/venue-booking" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Venue Booking
                </Link>
              </li>
              <li>
                <Link to="/services/catering" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Catering Services
                </Link>
              </li>
              <li>
                <Link to="/services/photography" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Photography & Video
                </Link>
              </li>
              <li>
                <Link to="/services/entertainment" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Entertainment
                </Link>
              </li>
              <li>
                <Link to="/services/event-planning" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Event Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6">Subscribe to Our Newsletter</h3>
            <p className="text-slate-300 mb-4">Get the latest updates on new venues and exclusive offers.</p>
            <form className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-r-xl transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className="mt-6">
              <h4 className="text-base font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-slate-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="bg-slate-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="bg-slate-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="bg-slate-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© {currentYear} VenueGo. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
