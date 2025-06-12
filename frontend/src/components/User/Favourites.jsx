import { useState } from "react"
import { Star, MapPin, Users, Trash2 } from "lucide-react"

// Mock data for favorite venues
const initialFavorites = [
  {
    id: 1,
    name: "Elegant Ballroom",
    location: "Downtown",
    capacity: 200,
    image: "https://picsum.photos/seed/venue1/300/200",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Rustic Barn",
    location: "Countryside",
    capacity: 150,
    image: "https://picsum.photos/seed/venue2/300/200",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Beachfront Resort",
    location: "Coastal Area",
    capacity: 250,
    image: "https://picsum.photos/seed/venue3/300/200",
    rating: 4.9,
  },
  {
    id: 4,
    name: "City View Rooftop",
    location: "City Center",
    capacity: 100,
    image: "https://picsum.photos/seed/venue4/300/200",
    rating: 4.7,
  },
]

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState(initialFavorites)

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter((venue) => venue.id !== id))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorite Venues</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600 text-center">You haven't added any venues to your favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{venue.name}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span>{venue.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Users size={16} className="mr-1" />
                  <span>Capacity: {venue.capacity}</span>
                </div>
                <div className="flex items-center text-yellow-500 mb-4">
                  <Star size={16} className="mr-1" />
                  <span>{venue.rating.toFixed(1)}</span>
                </div>
                <button
                  onClick={() => removeFromFavorites(venue.id)}
                  className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                >
                  <Trash2 size={16} className="mr-2" />
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage

