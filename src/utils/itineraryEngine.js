/**
 * Smart Itinerary Engine v2 — Egypt Tourism App
 * ───────────────────────────────────────────────
 * Major improvements over v1:
 *  1. Weighted scoring: rating × variety × proximity (not just nearest-neighbor)
 *  2. Category diversity enforcement — won't stack 3 mosques in a row
 *  3. Optimal city routing via nearest-city TSP heuristic
 *  4. Time-of-day awareness per category (sunrise temples, sunset beaches, etc.)
 *  5. Dynamic budget scaling by tripStyle (economy/comfort/luxury)
 *  6. Breakfast & coffee break placeholders
 *  7. Transit placeholders between cities with estimated duration
 *  8. Smarter hidden gems: popularity-inverse scoring, not just rating range
 *  9. Couple-friendly romantic spot boosting
 * 10. Fatigue-aware scheduling — lighter afternoon after heavy morning
 */

// ── Geo helpers ──────────────────────────────────────────────────────────────

export const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const toRad = x => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** City centroid from its places */
const getCityCentroid = (places) => {
    if (!places.length) return { lat: 30.0, lng: 31.2 }; // Cairo fallback
    const sum = places.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / places.length, lng: sum.lng / places.length };
};

/** Transit time estimate in minutes */
export const estimateTransit = (p1, p2, tripStyle = 'comfort') => {
    if (!p1?.lat || !p2?.lat) return 30;
    const dist = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const multiplier = tripStyle === 'economy' ? 1.4 : tripStyle === 'luxury' ? 0.8 : 1.0;
    if (dist < 3)   return Math.round(10 * multiplier);
    if (dist < 10)  return Math.round(20 * multiplier);
    if (dist < 25)  return Math.round(40 * multiplier);
    if (dist < 80)  return Math.round(75 * multiplier);
    if (dist < 300) return Math.round(180 * multiplier);
    return 300; // flight needed
};

/** Returns true if two places require overnight travel */
export const requiresOvernightTransit = (p1, p2) => {
    if (!p1?.lat || !p2?.lat) return false;
    return haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng) > 300;
};

// ── Duration / Price parsers ─────────────────────────────────────────────────

export const parseDurationHours = (str) => {
    if (!str) return 2;
    const lower = str.toLowerCase();
    if (lower.includes('full day')) return 6;
    if (lower.includes('half day')) return 3;
    if (lower.includes('full night')) return 5;
    const days = lower.match(/(\d+)\s*day/);
    if (days) return Math.min(parseInt(days[1]) * 5, 10);
    const range = str.match(/(\d+)\s*-\s*(\d+)/);
    if (range) return (parseInt(range[1]) + parseInt(range[2])) / 2;
    const single = str.match(/(\d+)/);
    return single ? Math.min(parseInt(single[1]), 8) : 2;
};

export const parsePrice = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const lower = str.toLowerCase();
    if (lower === 'free' || lower === 'مجاناً' || lower === 'مجاني') return 0;
    if (lower === 'high') return 800;
    if (lower === 'moderate') return 300;
    if (lower === 'variable' || lower.includes('rental')) return 250;
    if (lower === 'budget') return 150;
    const m = str.match(/(\d+)/);
    return m ? parseInt(m[1]) : 100;
};

// ── Time formatter ───────────────────────────────────────────────────────────

export const minutesToTimeStr = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    let h = hours24 % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

// ── Smart start time per category ────────────────────────────────────────────

const BEST_VISIT_WINDOW = {
    Pharaonic:  { ideal: 8,  latest: 14, label: 'Morning (avoid heat)' },
    Nature:     { ideal: 7,  latest: 16, label: 'Early morning' },
    Beach:      { ideal: 9,  latest: 16, label: 'Morning/Afternoon' },
    Diving:     { ideal: 8,  latest: 14, label: 'Morning dive' },
    Medical:    { ideal: 9,  latest: 15, label: 'Morning' },
    Cultural:   { ideal: 10, latest: 17, label: 'Flexible' },
    Islamic:    { ideal: 10, latest: 17, label: 'Flexible' },
    Historical: { ideal: 9,  latest: 16, label: 'Morning' },
    Snorkeling: { ideal: 9,  latest: 15, label: 'Morning' },
    Christian:  { ideal: 10, latest: 16, label: 'Morning' },
    Nightlife:  { ideal: 22, latest: 24, label: 'Night only' },
};

const getVisitWindow = (category) => BEST_VISIT_WINDOW[category] || { ideal: 10, latest: 17 };

// ── Category emoji ───────────────────────────────────────────────────────────

export const CATEGORY_ICON = {
    Pharaonic: '🏛️', Islamic: '🕌', Beach: '🏖️', Nature: '🌵',
    Diving: '🤿', Medical: '♨️', Nightlife: '🪩', Cultural: '🎭',
    Historical: '⚔️', Snorkeling: '🐠', Christian: '⛪',
};

// ── Weighted place scoring ───────────────────────────────────────────────────

/**
 * Score a candidate place considering multiple factors:
 *  - Rating (quality)
 *  - Distance from last place (proximity bonus)
 *  - Category diversity (penalty if same category was just visited)
 *  - Time fit (bonus if current time matches ideal visit window)
 *  - Traveler preference boost (romantic spots for couples, etc.)
 */
const scorePlaceCandidate = ({
    place,
    lastPlace,
    recentCategories,
    currentTimeMinutes,
    tripStyle,
    travelerType,
}) => {
    let score = 0;

    // 1. Quality score (0-10 scale, rating is 0-5)
    score += (place.rating || 4.0) * 2;

    // 2. Proximity bonus (closer = better, max +5)
    if (lastPlace?.lat && place.lat) {
        const dist = haversineDistance(lastPlace.lat, lastPlace.lng, place.lat, place.lng);
        if (dist < 3) score += 5;
        else if (dist < 10) score += 3;
        else if (dist < 25) score += 1;
        else score -= 2; // penalty for far places
    }

    // 3. Category diversity (penalty if just visited same category)
    const lastCat = recentCategories[recentCategories.length - 1];
    const secondLastCat = recentCategories[recentCategories.length - 2];
    if (place.category === lastCat) score -= 4;
    if (place.category === secondLastCat) score -= 2;

    // 4. Time-fit bonus
    const window = getVisitWindow(place.category);
    const currentHour = currentTimeMinutes / 60;
    if (currentHour >= window.ideal && currentHour <= window.latest) {
        score += 3; // perfect timing
    } else if (currentHour < window.ideal) {
        score -= 1; // too early
    } else {
        score -= 3; // too late for this category
    }

    // 5. Traveler type bonuses
    if (travelerType === 'couple') {
        // Boost scenic/romantic spots
        const romanticCats = ['Beach', 'Nature', 'Cultural'];
        if (romanticCats.includes(place.category)) score += 1;
        // Boost places with specific romantic keywords
        const desc = (place.descriptionEn || '').toLowerCase();
        if (desc.includes('sunset') || desc.includes('cruise') || desc.includes('view') || desc.includes('romantic') || desc.includes('couple')) score += 2;
    }
    if (travelerType === 'solo') {
        // Boost adventurous spots
        if (['Diving', 'Nature', 'Nightlife'].includes(place.category)) score += 1;
        const desc = (place.descriptionEn || '').toLowerCase();
        if (desc.includes('solo') || desc.includes('energetic') || desc.includes('adventure')) score += 2;
    }

    // 6. Price consideration by trip style
    const price = parsePrice(place.price);
    if (tripStyle === 'economy' && price > 500) score -= 2;
    if (tripStyle === 'luxury' && price < 100 && place.category !== 'Islamic') score -= 1;

    // 7. Hard timing constraints for Nature Reserves & Historical Sites
    // Blue Hole (901) closes at 5 PM. The trio takes ~5-6 hours.
    if (place.id === 901 && currentHour > 11.5) score -= 100;
    
    // Giza Pyramids (1), Egyptian Museum (3), Saladin Citadel (21), Saqqara (24), Karnak (2), Philae (15) close early.
    // They are the start of large bundles, so they MUST be scheduled before 12:30 PM.
    if ([1, 3, 21, 24, 2, 15].includes(place.id) && currentHour > 12.5) {
        score -= 100;
    }

    // Hot Air Balloon (1603) MUST be an early morning activity (sunrise).
    // If it's past 8 AM, heavily penalize it so it moves to the next day's morning.
    if (place.id === 1603 && currentHour > 8) {
        score -= 200; // Extremely heavy penalty
    }

    return score;
};

// ── Nearest-city TSP heuristic ───────────────────────────────────────────────

const orderCitiesByRoute = (hubs) => {
    if (hubs.length <= 2) return hubs;

    const ordered = [hubs[0]]; // start from hub with most places
    const remaining = hubs.slice(1);

    while (remaining.length > 0) {
        const lastCity = ordered[ordered.length - 1];
        const lastCentroid = getCityCentroid(lastCity.places);

        let bestIdx = 0;
        let bestDist = Infinity;
        remaining.forEach((hub, idx) => {
            const centroid = getCityCentroid(hub.places);
            const dist = haversineDistance(lastCentroid.lat, lastCentroid.lng, centroid.lat, centroid.lng);
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = idx;
            }
        });

        ordered.push(remaining[bestIdx]);
        remaining.splice(bestIdx, 1);
    }

    return ordered;
};

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * @param {Object} opts
 * @param {Array}  opts.places          - All available places (merged local + admin)
 * @param {number} opts.duration        - Trip duration in days
 * @param {Array}  opts.selectedInterests - Category strings e.g. ['Pharaonic','Beach']
 * @param {string} opts.travelerType    - 'solo' | 'couple' | 'family' | 'group'
 * @param {string} opts.tripStyle       - 'economy' | 'comfort' | 'luxury'
 * @param {number} opts.budgetPerDay    - Max EGP budget per day (0 = unlimited)
 * @param {boolean} opts.includeHiddenGems - Add lower-rated but unique spots
 * @param {Array}  opts.selectedCities  - City names to target (empty = auto-select)
 * @param {number} opts.travelers       - Number of travelers (affects budget)
 * @param {string} opts.isRTL           - Language flag for name labeling
 * @returns {{ itinerary: Object, warnings: string[], estimatedCost: number }}
 */
export const generateSmartItinerary = ({
    places,
    duration,
    selectedInterests,
    travelerType = 'couple',
    tripStyle = 'comfort',
    budgetPerDay = 0,
    includeHiddenGems = false,
    selectedCities = [],
    travelers = 2,
    isRTL = false,
}) => {
    const warnings = [];

    // ── 1. Filter candidates ──────────────────────────────────────────────

    let candidates = (places || [])
        .filter(p =>
            selectedInterests.includes(p.category) &&
            p.lat && p.lng &&
            typeof p.rating === 'number' &&
            (selectedCities.length === 0 || selectedCities.includes(p.cityEn || p.city))
        );

    // Family safety: skip nightlife & diving
    if (travelerType === 'family') {
        candidates = candidates.filter(p => !['Nightlife', 'Diving'].includes(p.category));
    }

    // Budget pre-filter
    if (budgetPerDay > 0) {
        const maxPlacePrice = budgetPerDay * 0.6;
        candidates = candidates.filter(p => parsePrice(p.price) <= maxPlacePrice);
    }

    if (candidates.length === 0) {
        return { itinerary: null, warnings: ['NO_PLACES'], estimatedCost: 0 };
    }

    // ── 2. Hidden gems: popularity-inverse scoring ────────────────────────

    if (includeHiddenGems) {
        const allMatchingCategory = (places || []).filter(p =>
            selectedInterests.includes(p.category) && p.lat && p.lng && p.rating
        );
        // Find places with good ratings but few highlights (less "famous")
        const gems = allMatchingCategory
            .filter(p =>
                p.rating >= 4.2 && p.rating < 4.7 &&
                !candidates.find(c => c.id === p.id)
            )
            .sort((a, b) => {
                // Prefer places with fewer highlights (less touristy)
                const aHL = (a.highlights || []).length;
                const bHL = (b.highlights || []).length;
                return aHL - bHL || b.rating - a.rating;
            })
            .slice(0, Math.min(3, Math.ceil(duration / 2)));

        gems.forEach(g => candidates.push(g));
    }

    // ── 3. City-hub clustering ────────────────────────────────────────────

    const cityMap = {};
    candidates.forEach(p => {
        const city = p.cityEn || p.city;
        if (!cityMap[city]) cityMap[city] = [];
        cityMap[city].push(p);
    });

    // Select hubs: if cities explicitly selected, use all of them; otherwise auto-limit
    const maxHubs = selectedCities.length > 0
        ? selectedCities.length
        : (duration <= 2 ? 1 : duration <= 4 ? 2 : duration <= 7 ? 3 : Math.min(4, Object.keys(cityMap).length));

    let hubs = Object.entries(cityMap)
        .map(([city, ps]) => ({
            city,
            places: ps,
            // Hub score = sum of ratings × count (prefer cities with more + better places)
            hubScore: ps.reduce((s, p) => s + (p.rating || 4), 0),
        }))
        .sort((a, b) => b.hubScore - a.hubScore)
        .slice(0, maxHubs);

    // ── 4. Route optimization (nearest-city TSP) ──────────────────────────

    hubs = orderCitiesByRoute(hubs);

    // Long-distance warnings
    for (let i = 0; i < hubs.length - 1; i++) {
        const h0 = hubs[i].places[0];
        const h1 = hubs[i + 1].places[0];
        if (h0 && h1 && requiresOvernightTransit(h0, h1)) {
            warnings.push('LONG_DISTANCE_TRANSIT');
            break;
        }
    }

    // ── 5. Allocate days to hubs proportionally ───────────────────────────

    const totalHubScore = hubs.reduce((s, h) => s + h.hubScore, 0);
    hubs.forEach(h => {
        h.allocatedDays = Math.max(1, Math.round((h.hubScore / totalHubScore) * duration));
    });
    // Fix rounding errors
    let allocated = hubs.reduce((s, h) => s + h.allocatedDays, 0);
    while (allocated > duration) {
        // Remove from hub with most days
        const maxHub = hubs.reduce((a, b) => a.allocatedDays > b.allocatedDays ? a : b);
        if (maxHub.allocatedDays > 1) { maxHub.allocatedDays--; allocated--; }
        else break;
    }
    while (allocated < duration) {
        // Add to hub with most remaining places
        const bestHub = hubs.reduce((a, b) => {
            const aRemaining = a.places.length;
            const bRemaining = b.places.length;
            return aRemaining > bRemaining ? a : b;
        });
        bestHub.allocatedDays++;
        allocated++;
    }

    // ── 6. Pace settings per traveler type ────────────────────────────────

    const PACE = {
        solo:   { maxDay: 5, lunchDur: 45, dinnerDur: 60,  breakChance: 0.2 },
        couple: { maxDay: 3, lunchDur: 75, dinnerDur: 90,  breakChance: 0.4 },
        family: { maxDay: 2, lunchDur: 90, dinnerDur: 75,  breakChance: 0.6 },
        group:  { maxDay: 4, lunchDur: 60, dinnerDur: 75,  breakChance: 0.3 },
    };
    const pace = PACE[travelerType] || PACE.couple;

    // Budget multipliers by trip style
    const BUDGET_MULT = { economy: 0.7, comfort: 1.0, luxury: 1.8 };
    const budgetMult = BUDGET_MULT[tripStyle] || 1.0;

    const DAY_END_DAYTIME = 18.5 * 60; // 6:30 PM
    const NIGHTLIFE_START = 22 * 60;

    let totalEstimatedCost = 0;
    const days = [];
    const visitedIds = new Set();

    // ── 7. Build each day ─────────────────────────────────────────────────

    for (let hubIdx = 0; hubIdx < hubs.length; hubIdx++) {
        const hub = hubs[hubIdx];
        const daytimePlaces = hub.places.filter(p => p.category !== 'Nightlife');
        const nightlifePlaces = hub.places.filter(p => p.category === 'Nightlife');

        let dayTimeQueue = [...daytimePlaces];
        let nightQueue = [...nightlifePlaces];

        for (let d = 0; d < hub.allocatedDays; d++) {
            const activities = [];
            let cost = 0;
            const recentCategories = [];

            // ── Travel day placeholder (between hubs) ──
            if (d === 0 && hubIdx > 0) {
                const prevHub = hubs[hubIdx - 1];
                const prevCentroid = getCityCentroid(prevHub.places);
                const thisCentroid = getCityCentroid(hub.places);
                const transitMins = estimateTransit(
                    { lat: prevCentroid.lat, lng: prevCentroid.lng },
                    { lat: thisCentroid.lat, lng: thisCentroid.lng },
                    tripStyle
                );
                activities.push({
                    placeId: `TRANSIT_${prevHub.city}_${hub.city}`,
                    type: 'transit_placeholder',
                    time: minutesToTimeStr(8 * 60),
                    city: hub.city,
                    fromCity: prevHub.city,
                    toCity: hub.city,
                    estimatedMinutes: transitMins,
                    title: isRTL
                        ? `🚗 انتقال: ${prevHub.city} → ${hub.city} (~${Math.round(transitMins / 60)}h)`
                        : `🚗 Transit: ${prevHub.city} → ${hub.city} (~${Math.round(transitMins / 60)}h)`,
                    image: '🚗',
                    category: isRTL ? 'انتقال' : 'Transit',
                });
            }

            // ── Hotel check-in on first day of each hub ──
            if (d === 0) {
                activities.push({
                    placeId: `CHOOSE_HOTEL_${hub.city}`,
                    type: 'hotel_placeholder',
                    city: hub.city,
                    time: minutesToTimeStr(9 * 60),
                });
            }

            // ── Smart start time ──
            const hasOnlyNight = daytimePlaces.length === 0 && nightlifePlaces.length > 0;
            let currentTime = hasOnlyNight ? 14 * 60 : 9 * 60;

            // If transit day, adjust start time
            if (d === 0 && hubIdx > 0) {
                const prevCentroid = getCityCentroid(hubs[hubIdx - 1].places);
                const thisCentroid = getCityCentroid(hub.places);
                const transitMins = estimateTransit(
                    { lat: prevCentroid.lat, lng: prevCentroid.lng },
                    { lat: thisCentroid.lat, lng: thisCentroid.lng },
                    tripStyle
                );
                currentTime = Math.max(currentTime, 8 * 60 + transitMins + 30); // arrival + settle
            }

            // ── Breakfast (only if starting before noon) ──
            if (currentTime < 11 * 60 && !hasOnlyNight) {
                activities.push({
                    placeId: 'BREAKFAST',
                    type: 'meal',
                    time: minutesToTimeStr(Math.max(currentTime, 8 * 60)),
                    city: hub.city,
                });
                currentTime = Math.max(currentTime, 8 * 60) + 45;
            }

            // ── Daytime activities (weighted scoring selection) ──
            let placesThisDay = 0;
            let lastPlace = null;
            let lunchAdded = false;
            let morningHeavy = false; // track if morning was activity-heavy

            while (dayTimeQueue.length > 0 && placesThisDay < pace.maxDay) {
                // Clean visited
                dayTimeQueue = dayTimeQueue.filter(p => !visitedIds.has(p.id));
                if (dayTimeQueue.length === 0) break;

                // Score all candidates
                const scored = dayTimeQueue.map((p, idx) => ({
                    place: p,
                    idx,
                    score: scorePlaceCandidate({
                        place: p,
                        lastPlace,
                        recentCategories,
                        currentTimeMinutes: currentTime,
                        tripStyle,
                        travelerType,
                    }),
                }));

                // Sort by score descending, pick best
                scored.sort((a, b) => b.score - a.score);
                const best = scored[0];
                const next = best.place;

                const transit = lastPlace ? estimateTransit(lastPlace, next, tripStyle) : 15;
                const visitMins = parseDurationHours(next.duration) * 60;

                // Check if fits in daytime
                if (currentTime + transit + visitMins > DAY_END_DAYTIME) break;

                // Ideal start time adjustment for first place of day
                if (placesThisDay === 0) {
                    const window = getVisitWindow(next.category);
                    currentTime = Math.max(currentTime, window.ideal * 60);
                }

                currentTime += transit;

                // ── Lunch break (12:00–14:30) ──
                if (!lunchAdded && currentTime >= 12 * 60 && currentTime <= 14.5 * 60) {
                    activities.push({
                        placeId: 'LUNCH',
                        type: 'meal',
                        time: minutesToTimeStr(currentTime),
                        city: hub.city,
                    });
                    currentTime += pace.lunchDur;
                    lunchAdded = true;
                }

                // ── Fatigue management (deterministic) ──
                // Threshold: family→2, couple→3, group→4, solo→5 activities before rest
                if (placesThisDay >= 2 && currentTime >= 15 * 60 && currentTime <= 16.5 * 60) {
                    const fatigueThreshold = Math.ceil(1 / pace.breakChance);
                    if (placesThisDay >= fatigueThreshold) {
                        break; // Lighter afternoon — move to dinner
                    }
                }

                activities.push({
                    placeId: next.id,
                    type: 'place',
                    time: minutesToTimeStr(currentTime),
                });
                cost += parsePrice(next.price);
                currentTime += visitMins;
                recentCategories.push(next.category);
                lastPlace = next;
                visitedIds.add(next.id);
                dayTimeQueue.splice(dayTimeQueue.indexOf(next), 1);
                placesThisDay++;

                // ── HARD BUNDLES INJECTION ──
                const HARD_BUNDLES = {
                    // Dahab: Blue Hole -> Abu Galum -> Blue Lagoon
                    901: {
                        ids: [902, 906],
                        transitTime: 30,
                        getCost: (style, pax) => style === 'luxury' ? 1500 / Math.max(1, pax) : style === 'comfort' ? 300 : 150,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'قارب سريع خاص (سبيد بوت)' : 'Private Speedboat') : style === 'comfort' ? (isRTL ? 'مركب صغير / جمال خاصة' : 'Small Boat / Private Camels') : (isRTL ? 'مركب تشاركي / جمل' : 'Shared Boat / Camel'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بحري' : 'Sea Transit',
                        getIcon: () => '🚤',
                    },
                    // Giza: Pyramids -> GEM
                    1: {
                        ids: [26],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 400 / Math.max(1, pax) : 50,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / تاكسي' : 'Uber / Taxi'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بري' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // Giza: Saqqara -> Memphis -> Dahshur
                    24: {
                        ids: [1505, 1504],
                        transitTime: 20,
                        getCost: (style, pax) => style === 'luxury' ? 500 / Math.max(1, pax) : 60,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة سياحية خاصة' : 'Private Tourist Car') : (isRTL ? 'أوبر / تاكسي' : 'Uber / Taxi'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بري' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // Cairo Downtown: Egyptian Museum -> Cairo Tower -> Felucca
                    3: {
                        ids: [1501, 1502],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 250 / Math.max(1, pax) : 30,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / مشي' : 'Uber / Walk'),
                        getCategory: (isRTL) => isRTL ? 'انتقال' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // Cairo Islamic: Saladin Citadel -> Al-Azhar Park -> Khan el-Khalili
                    21: {
                        ids: [1503, 4],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 400 / Math.max(1, pax) : 50,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / ميكروباص' : 'Uber / Minibus'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بري' : 'Transit',
                        getIcon: () => '🚐',
                    },
                    // Luxor East Bank: Karnak Temple -> Luxor Museum -> Luxor Temple
                    2: {
                        ids: [1602, 8],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 400 / Math.max(1, pax) : 50,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة سياحية خاصة' : 'Private Tourist Car') : (isRTL ? 'أوبر / حنطور' : 'Uber / Carriage'),
                        getCategory: (isRTL) => isRTL ? 'انتقال' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // Luxor West Bank: Hot Air Balloon -> Valley of the Kings -> Hatshepsut -> Colossi of Memnon
                    1603: {
                        ids: [7, 19, 1601],
                        transitTime: 20,
                        getCost: (style, pax) => style === 'luxury' ? 800 / Math.max(1, pax) : 100,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مع مرشد' : 'Private Car & Guide') : (isRTL ? 'ميكروباص سياحي' : 'Tourist Minibus'),
                        getCategory: (isRTL) => isRTL ? 'انتقال البر الغربي' : 'West Bank Transit',
                        getIcon: () => '🚐',
                    },
                    // Aswan: Philae Temple -> High Dam -> Unfinished Obelisk
                    15: {
                        ids: [1302, 1303],
                        transitTime: 20,
                        getCost: (style, pax) => style === 'luxury' ? 400 / Math.max(1, pax) : 50,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / ميكروباص' : 'Uber / Minibus'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بري' : 'Transit',
                        getIcon: () => '🚐',
                    },
                    // Alexandria: Library -> Qaitbay
                    13: {
                        ids: [16],
                        transitTime: 20,
                        getCost: (style, pax) => style === 'luxury' ? 300 / Math.max(1, pax) : 40,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / تاكسي كورنيش' : 'Uber / Corniche Taxi'),
                        getCategory: (isRTL) => isRTL ? 'انتقال كورنيش' : 'Corniche Transit',
                        getIcon: () => '🚕',
                    },
                    // Alexandria Historical: Catacombs -> Roman Amphitheatre
                    1804: {
                        ids: [1803],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 200 / Math.max(1, pax) : 30,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / تاكسي' : 'Uber / Taxi'),
                        getCategory: (isRTL) => isRTL ? 'انتقال' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // Alexandria Coastal: Montazah -> Stanley Bridge
                    1801: {
                        ids: [1802],
                        transitTime: 20,
                        getCost: (style, pax) => style === 'luxury' ? 250 / Math.max(1, pax) : 40,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / ميكروباص' : 'Uber / Minibus'),
                        getCategory: (isRTL) => isRTL ? 'انتقال كورنيش' : 'Corniche Transit',
                        getIcon: () => '🚐',
                    },
                    // Hurghada: Grand Aquarium -> Hurghada Marina
                    1703: {
                        ids: [1702],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 200 / Math.max(1, pax) : 30,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'سيارة خاصة مكيفة' : 'Private AC Car') : (isRTL ? 'أوبر / تاكسي' : 'Uber / Taxi'),
                        getCategory: (isRTL) => isRTL ? 'انتقال بري' : 'Transit',
                        getIcon: () => '🚕',
                    },
                    // El Gouna: Zeytouna Beach -> Abu Tig Marina
                    1705: {
                        ids: [1704],
                        transitTime: 15,
                        getCost: (style, pax) => style === 'luxury' ? 150 / Math.max(1, pax) : 25,
                        getTitle: (style, isRTL) => style === 'luxury' ? (isRTL ? 'قارب خاص / ليموزين' : 'Private Boat / Limo') : (isRTL ? 'توك توك الجونة' : 'El Gouna Tuk-Tuk'),
                        getCategory: (isRTL) => isRTL ? 'انتقال الجونة' : 'Gouna Transit',
                        getIcon: () => '🛺',
                    }
                };

                const bundle = HARD_BUNDLES[next.id];
                if (bundle) {
                    // Pre-check: estimate if entire bundle fits within daytime
                    let bundleEstimate = 0;
                    bundle.ids.forEach(bid => {
                        const bp = (places || []).find(p => p.id === bid);
                        if (bp && !visitedIds.has(bid)) {
                            bundleEstimate += bundle.transitTime + parseDurationHours(bp.duration) * 60;
                        }
                    });

                    if (currentTime + bundleEstimate <= DAY_END_DAYTIME) {
                        for (const bid of bundle.ids) {
                            const bPlace = (places || []).find(p => p.id === bid);
                            if (bPlace && !visitedIds.has(bid)) {
                                // Add Transit Placeholder
                                activities.push({
                                    placeId: `TRANSIT_BUNDLE_${bid}`,
                                    type: 'transit_placeholder',
                                    time: minutesToTimeStr(currentTime),
                                    title: bundle.getTitle(tripStyle, isRTL),
                                    image: bundle.getIcon(),
                                    category: bundle.getCategory(isRTL),
                                    city: hub.city,
                                });
                                
                                cost += bundle.getCost(tripStyle, travelers);
                                currentTime += bundle.transitTime;

                                // Add the actual place
                                activities.push({
                                    placeId: bid,
                                    type: 'place',
                                    time: minutesToTimeStr(currentTime),
                                });
                                cost += parsePrice(bPlace.price);
                                currentTime += parseDurationHours(bPlace.duration) * 60;
                                recentCategories.push(bPlace.category);
                                visitedIds.add(bid);
                                placesThisDay++;
                                
                                // Remove from queue if it was there
                                const qIdx = dayTimeQueue.findIndex(p => p.id === bid);
                                if (qIdx !== -1) dayTimeQueue.splice(qIdx, 1);
                                lastPlace = bPlace;
                            }
                        }
                    }
                }
            }

            // Fallback lunch
            if (!lunchAdded && placesThisDay > 0 && !hasOnlyNight) {
                const lt = Math.max(currentTime, 13 * 60);
                activities.push({
                    placeId: 'LUNCH',
                    type: 'meal',
                    time: minutesToTimeStr(lt),
                    city: hub.city,
                });
                currentTime = lt + pace.lunchDur;
            }

            // ── Dinner ──
            if (placesThisDay > 0 || hasOnlyNight) {
                const dinnerTime = Math.max(currentTime, 19 * 60);
                activities.push({
                    placeId: 'DINNER',
                    type: 'meal',
                    time: minutesToTimeStr(dinnerTime),
                    city: hub.city,
                });
                currentTime = dinnerTime + pace.dinnerDur;
            }

            // ── Nightlife (strictly after 22:00) ──
            nightQueue = nightQueue.filter(p => !visitedIds.has(p.id));
            if (nightQueue.length > 0 && travelerType !== 'family') {
                // Pick best-rated nightlife spot
                nightQueue.sort((a, b) => (b.rating || 4) - (a.rating || 4));
                const nightPlace = nightQueue.shift();
                activities.push({
                    placeId: nightPlace.id,
                    type: 'place',
                    time: minutesToTimeStr(NIGHTLIFE_START),
                });
                cost += parsePrice(nightPlace.price);
                visitedIds.add(nightPlace.id);
            }

            // ── Sort activities by time ──
            activities.sort((a, b) => {
                const toMins = (tStr) => {
                    const [timePart, mod] = tStr.split(' ');
                    let [h, m] = timePart.split(':').map(Number);
                    if (mod === 'PM' && h !== 12) h += 12;
                    if (mod === 'AM' && h === 12) h = 0;
                    return h * 60 + m;
                };
                return toMins(a.time) - toMins(b.time);
            });

            // Apply budget multiplier
            cost = Math.round(cost * budgetMult);
            totalEstimatedCost += cost;

            if (budgetPerDay > 0 && cost > budgetPerDay) {
                warnings.push(`DAY_OVER_BUDGET_${days.length + 1}`);
            }

            if (activities.length > 0) {
                days.push({ activities });
            }
        }
    }

    if (days.length === 0) {
        return { itinerary: null, warnings: ['GENERATION_FAILED'], estimatedCost: 0 };
    }

    const itinerary = {
        name: isRTL ? 'رحلتي الذكية في مصر 🇪🇬' : 'My Smart Egypt Trip 🇪🇬',
        days,
        generatedAt: new Date().toISOString(),
        meta: { travelerType, tripStyle, duration, selectedInterests, selectedCities, travelers },
    };

    return { itinerary, warnings, estimatedCost: totalEstimatedCost };
};
