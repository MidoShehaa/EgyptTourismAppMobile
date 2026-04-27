/**
 * ============================================================
 *  EGYPT TOURISM APP — ADMIN DATA TEMPLATES
 *  Copy any template below, fill in the fields, then add it
 *  to the corresponding data file OR use the in-app AdminPanel.
 * ============================================================
 */

// ─────────────────────────────────────────
// CATEGORY IDs (use exactly as written)
// ─────────────────────────────────────────
export const PLACE_CATEGORIES = [
    'Pharaonic',
    'Islamic',
    'Beach',
    'Nature',
    'Diving',
    'Medical',
    'Nightlife',
    'Cultural',
];

export const HOTEL_CATEGORIES = [
    'luxury',
    'mid-range',
    'hostel',
    'budget',
];

export const RIDE_CATEGORIES = [
    'Pharaonic',
    'Islamic',
    'Beach',
    'Nature',
    'Cultural',
    'Diving',
];

// ─────────────────────────────────────────
// TEMPLATE 1: TOURIST PLACE
// ─────────────────────────────────────────
export const PLACE_TEMPLATE = {
    // Required — must be unique (last id + 1)
    id: 0,

    // Names (both required)
    name: '',           // Arabic name
    nameEn: '',         // English name

    // Location (both required)
    city: '',           // Arabic city name e.g. 'القاهرة'
    cityEn: '',         // English city name e.g. 'Cairo'

    // Category (required — pick one from PLACE_CATEGORIES)
    category: 'Pharaonic',

    // Descriptions (both required)
    description: '',    // Arabic description
    descriptionEn: '',  // English description (1-3 sentences)

    // Media (required)
    image: '🏛️',        // Emoji representing the place
    imageUrl: '',       // Direct image URL (Wikipedia Commons or Unsplash recommended)

    // Visitor info (all required)
    rating: 4.5,        // Number: 1.0 – 5.0
    duration: '2-3 hours', // e.g. '2-3 hours' | 'Full Day' | 'Half Day' | '2 Days'
    price: '400 EGP',  // e.g. '400 EGP' | 'Free' | 'Variable' | 'Free / Gear Rental'

    // Highlights: 2-4 short strings (required)
    highlights: ['Highlight 1', 'Highlight 2', 'Highlight 3'],

    // Practical tip for tourists (required — 1-2 sentences)
    tip: '',

    // GPS coordinates from Google Maps (required for Smart Trip algorithm)
    lat: 0.0,
    lng: 0.0,
};

// ─────────────────────────────────────────
// TEMPLATE 2: HOTEL / HOSTEL
// ─────────────────────────────────────────
export const HOTEL_TEMPLATE = {
    // Required — must be unique
    // Luxury/Mid-range: use numbers 1-99
    // Hostels: use 100-299 per city block
    // Budget: use 300+ per city block
    id: 0,

    name: '',           // Hotel name (English or Arabic)
    city: '',           // English city name — must match CITY_BASE_RATES keys

    // Category (pick one from HOTEL_CATEGORIES)
    category: 'mid-range',

    rating: 4.5,        // Number: 1.0 – 5.0
    price: 3000,        // Price per night in EGP (number, no text)

    // Direct image URL
    image: '',

    // 2-4 short feature strings (WiFi, Pool, Nile View, etc.)
    amenities: ['Amenity 1', 'Amenity 2'],
};

// ─────────────────────────────────────────
// TEMPLATE 3: FIXED TRIP (Rides Screen)
// ─────────────────────────────────────────
export const FIXED_TRIP_TEMPLATE = {
    // Required — lowercase, hyphens only e.g. 'cairo-luxor'
    id: 'city-destination',

    nameEn: '',         // English trip name
    nameAr: '',         // Arabic trip name

    from: '',           // Departure city (English)
    to: '',             // Destination city (English)

    durationHours: 8,   // Total trip duration in hours
    distanceKm: 100,    // Approximate road distance in KM

    // Base price in EGP for a standard Sedan vehicle
    // The pricing algorithm auto-multiplies by vehicle type
    basePrice: 1500,

    // Key stops/attractions along the route (2-5 items)
    stops: ['Stop 1', 'Stop 2', 'Stop 3'],

    imageUrl: '',       // Direct image URL

    rating: 4.5,        // Number: 1.0 – 5.0
    reviewCount: 50,    // Simulated review count

    // Category (pick one from RIDE_CATEGORIES)
    category: 'Pharaonic',
};

// ─────────────────────────────────────────
// TEMPLATE 4: RESTAURANT
// ─────────────────────────────────────────
export const RESTAURANT_TEMPLATE = {
    id: 0,              // Required — must be unique (last id + 1)
    name: '',           // Restaurant name
    city: '',           // English city name
    cuisine: '',        // e.g. 'Egyptian' | 'Mediterranean' | 'Italian' | 'Seafood'
    highlightDish: '',  // Signature / most popular dish
    rating: 4.5,        // Number: 1.0 – 5.0
    image: '',          // Direct image URL (Unsplash preferred)
    description: '',    // 1-2 sentence description
};

// ─────────────────────────────────────────
// TEMPLATE 5: CITY PRICING (Rides)
// ─────────────────────────────────────────
// Add to CITY_BASE_RATES in ridesData.js:
export const CITY_RATE_TEMPLATE = {
    // All prices in EGP
    hourly: 300,            // Price per hour for a sedan
    halfDay: 1000,          // 5-hour fixed package
    fullDay: 1800,          // 10-hour fixed package
    airportTransfer: 500,   // One-way airport run
};

// ─────────────────────────────────────────
// TEMPLATE 6: CULTURAL DATA FOR A CITY
// ─────────────────────────────────────────
// Add to culturalData.js under the city name key:
export const CULTURAL_DATA_TEMPLATE = {
    slang: [
        { term: 'Local Word', meaning: 'What it means for tourists' },
    ],
    traditions: [
        'Cultural tradition or social rule tourists should know.',
        'Another local custom.',
    ],
    history: 'One paragraph about city history relevant to tourists.',
    localTip: 'Insider tip only locals would know.',
};

// ─────────────────────────────────────────
// VALIDATION HELPERS
// used internally by AdminPanel
// ─────────────────────────────────────────
export function validatePlace(p) {
    const errors = [];
    if (!p.id || p.id <= 0)           errors.push('id must be a positive number');
    if (!p.name?.trim())              errors.push('Arabic name is required');
    if (!p.nameEn?.trim())            errors.push('English name is required');
    if (!p.city?.trim())              errors.push('Arabic city is required');
    if (!p.cityEn?.trim())            errors.push('English city is required');
    if (!PLACE_CATEGORIES.includes(p.category))
                                      errors.push(`category must be one of: ${PLACE_CATEGORIES.join(', ')}`);
    if (!p.description?.trim())       errors.push('Arabic description is required');
    if (!p.descriptionEn?.trim())     errors.push('English description is required');
    if (!p.imageUrl?.startsWith('http')) errors.push('imageUrl must be a valid URL');
    if (typeof p.rating !== 'number' || p.rating < 1 || p.rating > 5)
                                      errors.push('rating must be 1.0 – 5.0');
    if (!p.duration?.trim())          errors.push('duration is required');
    if (!p.price?.trim())             errors.push('price is required');
    if (!Array.isArray(p.highlights) || p.highlights.length < 1)
                                      errors.push('at least 1 highlight is required');
    if (!p.tip?.trim())               errors.push('tip is required');
    if (!p.lat || p.lat === 0)        errors.push('latitude (lat) is required');
    if (!p.lng || p.lng === 0)        errors.push('longitude (lng) is required');
    return errors;
}

export function validateHotel(h) {
    const errors = [];
    if (!h.id || h.id <= 0)          errors.push('id must be a positive number');
    if (!h.name?.trim())             errors.push('name is required');
    if (!h.city?.trim())             errors.push('city is required');
    if (!HOTEL_CATEGORIES.includes(h.category))
                                     errors.push(`category must be one of: ${HOTEL_CATEGORIES.join(', ')}`);
    if (typeof h.rating !== 'number' || h.rating < 1 || h.rating > 5)
                                     errors.push('rating must be 1.0 – 5.0');
    if (typeof h.price !== 'number' || h.price <= 0)
                                     errors.push('price must be a positive number (EGP per night)');
    if (!h.image?.startsWith('http')) errors.push('image must be a valid URL');
    if (!Array.isArray(h.amenities) || h.amenities.length < 1)
                                     errors.push('at least 1 amenity is required');
    return errors;
}

export function validateTrip(t) {
    const errors = [];
    if (!t.id?.trim())               errors.push('id is required (e.g. cairo-luxor)');
    if (!t.nameEn?.trim())           errors.push('English name is required');
    if (!t.nameAr?.trim())           errors.push('Arabic name is required');
    if (!t.from?.trim())             errors.push('from city is required');
    if (!t.to?.trim())               errors.push('to city is required');
    if (typeof t.durationHours !== 'number' || t.durationHours <= 0)
                                     errors.push('durationHours must be a positive number');
    if (typeof t.distanceKm !== 'number' || t.distanceKm <= 0)
                                     errors.push('distanceKm must be a positive number');
    if (typeof t.basePrice !== 'number' || t.basePrice <= 0)
                                     errors.push('basePrice must be a positive number');
    if (!Array.isArray(t.stops) || t.stops.length < 1)
                                     errors.push('at least 1 stop is required');
    if (!t.imageUrl?.startsWith('http')) errors.push('imageUrl must be a valid URL');
    return errors;
}
