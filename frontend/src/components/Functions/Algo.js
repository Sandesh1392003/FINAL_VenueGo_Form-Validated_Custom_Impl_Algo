// Binary search for venues by name or city (case-insensitive)
// Returns array of matching venues (could be multiple with same name/city)
export function binarySearchVenues(venues, searchTerm) {
    // venues: sorted array of venue objects
    // searchTerm: string to search (case-insensitive, partial match)
    if (!searchTerm) return venues

    const term = searchTerm.toLowerCase()
    let left = 0
    let right = venues.length - 1
    let results = []

    // Find one match using binary search (by name or city)
    while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const venue = venues[mid]
        const name = venue.name?.toLowerCase() || ""
        const city = venue.location?.city?.toLowerCase() || ""

        if (name.includes(term) || city.includes(term)) {
            // Expand to find all matches around mid
            let i = mid
            while (i >= 0 && (venues[i].name?.toLowerCase().includes(term) || venues[i].location?.city?.toLowerCase().includes(term))) {
                i--
            }
            i++
            while (
                i < venues.length &&
                (venues[i].name?.toLowerCase().includes(term) || venues[i].location?.city?.toLowerCase().includes(term))
            ) {
                results.push(venues[i])
                i++
            }
            break
        } else if (name < term && city < term) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    return results
}

// Trie node for autocompletion
class TrieNode {
    constructor() {
        this.children = {}
        this.isEndOfWord = false
        this.venueRefs = [] // Store references to venues for autocompletion
    }
}

// Trie data structure for autocompletion
export class VenueTrie {
    constructor() {
        this.root = new TrieNode()
    }

    // Insert a word (venue name or city) with a reference to the venue object
    insert(word, venue) {
        let node = this.root
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode()
            }
            node = node.children[char]
        }
        node.isEndOfWord = true
        node.venueRefs.push(venue)
    }

    // Get all venues that match the given prefix (autocomplete)
    autocomplete(prefix) {
        let node = this.root
        for (const char of prefix.toLowerCase()) {
            if (!node.children[char]) {
                return []
            }
            node = node.children[char]
        }
        // Collect all venues from this node down
        const results = []
        function dfs(n) {
            if (n.isEndOfWord) {
                results.push(...n.venueRefs)
            }
            for (const child in n.children) {
                dfs(n.children[child])
            }
        }
        dfs(node)
        return results
    }
}
