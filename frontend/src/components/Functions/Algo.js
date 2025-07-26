// ===== Custom Floor Division (No Math.floor) =====
function customFloorDivision(a, b) {
    let result = a / b;
    let intPart = 0;
    while (intPart + 1 <= result) {
        intPart++;
    }
    return intPart;
}

// ===== Custom Binary Search (No toLowerCase, No Math.floor) =====
function customBinarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    // Manual lowercase conversion of target
    let targetVal = "";
    for (let i = 0; i < target.length; i++) {
        targetVal +=
            target[i] >= "A" && target[i] <= "Z"
                ? String.fromCharCode(target[i].charCodeAt(0) + 32)
                : target[i];
    }

    while (left <= right) {
        let mid = customFloorDivision(left + right, 2);

        // Manual lowercase conversion of mid element
        let midVal = "";
        for (let i = 0; i < arr[mid].length; i++) {
            midVal +=
                arr[mid][i] >= "A" && arr[mid][i] <= "Z"
                    ? String.fromCharCode(arr[mid][i].charCodeAt(0) + 32)
                    : arr[mid][i];
        }

        if (midVal === targetVal) return true;
        else if (midVal < targetVal) left = mid + 1;
        else right = mid - 1;
    }
    return false;
}

// ===== Trie Node Constructor =====
function TrieNode() {
    this.children = {}; // next letters
    this.isEndOfWord = false; // end of a valid word
    this.venues = []; // venue objects matching this prefix
}

// ===== VenueTrie Constructor =====
function VenueTrie() {
    this.root = new TrieNode();
}

// ===== Insert a venue name into Trie =====
VenueTrie.prototype.insert = function (venueName, venueDetails) {
    let node = this.root;
    for (let char of venueName.toLowerCase()) {
        if (!node.children[char]) {
            node.children[char] = new TrieNode();
        }
        node = node.children[char];
        node.venues.push(venueDetails); // track venues for this prefix
    }
    node.isEndOfWord = true;
};

// ===== Search for venues matching prefix =====
VenueTrie.prototype.search = function (prefix) {
    let node = this.root;
    for (let char of prefix.toLowerCase()) {
        if (!node.children[char]) {
            return [];
        }
        node = node.children[char];
    }
    return node.venues;
};

// ===== Get top 5 autocomplete suggestions =====
function getTopSuggestions(trie, prefix) {
    const matches = trie.search(prefix);
    return matches.slice(0, 5); // only 5 suggestions
}

// ===== Binary Search on venues (partial, case-insensitive match) =====
function binarySearchVenues(venues, searchTerm) {
    if (!searchTerm) return venues;

    const term = searchTerm.toLowerCase();
    let left = 0;
    let right = venues.length - 1;
    let results = [];

    while (left <= right) {
        const mid = customFloorDivision(left + right, 2);
        const venue = venues[mid];
        const name = venue.name ? venue.name.toLowerCase() : "";
        const city = venue.location?.city ? venue.location.city.toLowerCase() : "";

        if (name.includes(term) || city.includes(term)) {
            // Expand around mid
            let i = mid;
            while (
                i >= 0 &&
                (venues[i].name?.toLowerCase().includes(term) ||
                    venues[i].location?.city?.toLowerCase().includes(term))
            ) {
                i--;
            }
            i++;
            while (
                i < venues.length &&
                (venues[i].name?.toLowerCase().includes(term) ||
                    venues[i].location?.city?.toLowerCase().includes(term))
            ) {
                results.push(venues[i]);
                i++;
            }
            break;
        } else if (name < term && city < term) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return results;
}

// ===== Exports =====
export {
    VenueTrie,
    getTopSuggestions,
    customBinarySearch,
    binarySearchVenues,
    customFloorDivision
};
