/**
 * Smart Itinerary Engine - Egypt Tourism App
 * Inspired by TripAdvisor / Google Travel planning best practices:
 *  - Geographic clustering (minimize travel time)
 *  - Time-aware scheduling (early birds vs night owls)
 *  - Pace-aware scheduling per traveler type
 *  - Budget filtering
 *  - Long-distance transit warnings
 *  - Hidden gems discovery (lower-rated places occasionally included)
 *  - Strict nightlife-after-22:00 rule
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

/** Transit time estimate in minutes */
export const estimateTransit = (p1, p2, tripStyle = 'comfort') => {
    if (!p1?.lat || !p2?.lat) return 30;
    const dist = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const multiplier = tripStyle === 'economy' ? 1.4 : tripStyle === 'luxury' ? 0.8 : 1.0;
    if (dist < 3)   return Math.round(10 * multiplier);
    if (dist < 10)  return Math.round(20 * multiplier);
    if (dist < 25)  return Math.round(40 * multiplier);
    if (dist < 80)  return Math.round(75 * multiplier);
    if (dist < 300) return Math.round(180 * multiplier); // bus / train
    return 300; // flight needed
};

/** Returns true if two places are very far apart (different cities requiring overnight travel) */
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
    if (!str) return 0;
    const lower = str.toLowerCase();
    if (lower === 'free') return 0;
    if (lower === 'high') return 800;
    if (lower === 'moderate') return 300;
    if (lower === 'variable') return 250;
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

const BEST_VISIT_HOUR = {
    Pharaonic: 8,   // avoid midday heat
    Nature:    7,   // sunrise hikes
    Beach:     9,
    Diving:    8,
    Medical:   9,
    Cultural:  10,
    Islamic:   10,
    Nightlife: 22,  // strictly night
};

const getIdealStartHour = (category) => BEST_VISIT_HOUR[category] ?? 10;

// ── Category → emoji ─────────────────────────────────────────────────────────

export const CATEGORY_ICON = {
    Pharaonic: '🏛️', Islamic: '🕌', Beach: '🏖️', Nature: '🌵',
    Diving: '🤿', Medical: '♨️', Nightlife: '🪩', Cultural: '🎭',
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
 * @param {boolean} opts.includeHiddenGems - Occasionally add lower-rated gems
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
    isRTL = false,
}) => {
    const warnings = [];

    // 1. Filter by interest + quality
    let candidates = (places || [])
        .filter(p =>
            selectedInterests.includes(p.category) &&
            p.lat && p.lng &&
            typeof p.rating === 'number' &&
            p.id < 411 // exclude the 40 auto-generated nightlife placeholder entries
        );

    // Family: skip nightlife & diving
    if (travelerType === 'family') {
        candidates = candidates.filter(p => !['Nightlife', 'Diving'].includes(p.category));
    }

    // Budget filter (per-place rough check)
    if (budgetPerDay > 0) {
        const maxPlacePrice = budgetPerDay * 0.6; // single attraction ≤ 60% of daily budget
        candidates = candidates.filter(p => parsePrice(p.price) <= maxPlacePrice);
    }

    if (candidates.length === 0) {
        return { itinerary: null, warnings: ['NO_PLACES'], estimatedCost: 0 };
    }

    // 2. Hidden gems: mix in a few lower-rated but unique spots
    if (includeHiddenGems) {
        const gems = (places || []).filter(p =>
            selectedInterests.includes(p.category) && p.lat && p.lng &&
            p.rating >= 4.4 && p.rating < 4.6 && p.id < 411
        );
        // Sprinkle up to 2 gems
        gems.slice(0, 2).forEach(g => {
            if (!candidates.find(c => c.id === g.id)) candidates.push(g);
        });
    }

    // 3. Sort: rating desc (TripAdvisor-style top-rated first)
    candidates.sort((a, b) => b.rating - a.rating);

    // 4. City-hub clustering
    const cityMap = {};
    candidates.forEach(p => {
        const city = p.cityEn || p.city;
        if (!cityMap[city]) cityMap[city] = [];
        cityMap[city].push(p);
    });

    // 5. Select hubs based on duration
    const maxHubs = duration <= 3 ? 1 : duration <= 6 ? 2 : duration <= 10 ? 3 : 4;
    const hubs = Object.entries(cityMap)
        .map(([city, ps]) => ({ city, places: ps }))
        .sort((a, b) => b.places.length - a.places.length)
        .slice(0, maxHubs);

    // Warn about long-distance trips
    if (hubs.length > 1) {
        const h0 = hubs[0].places[0];
        const h1 = hubs[1].places[0];
        if (h0 && h1 && requiresOvernightTransit(h0, h1)) {
            warnings.push('LONG_DISTANCE_TRANSIT');
        }
    }

    // 6. Allocate days to hubs
    const totalDays = duration;
    hubs.forEach((h, i) => {
        h.allocatedDays = Math.max(1, Math.floor(totalDays / hubs.length));
    });
    let remainder = totalDays - hubs.reduce((s, h) => s + h.allocatedDays, 0);
    for (let i = 0; i < remainder; i++) hubs[i % hubs.length].allocatedDays++;

    // 7. Per-traveler pace settings
    const PACE = {
        solo:   { maxDay: 4, lunchDur: 45, breakChance: 0.3 },
        couple: { maxDay: 3, lunchDur: 60, breakChance: 0.4 },
        family: { maxDay: 2, lunchDur: 75, breakChance: 0.6 },
        group:  { maxDay: 3, lunchDur: 60, breakChance: 0.35 },
    };
    const pace = PACE[travelerType] || PACE.couple;

    const DAY_END_DAYTIME = 19 * 60; // 7 PM
    const NIGHTLIFE_START  = 22 * 60; // 10 PM strictly

    let totalEstimatedCost = 0;
    const days = [];
    const visitedIds = new Set();

    for (const hub of hubs) {
        // Separate nightlife from daytime for this hub
        const daytimePlaces = hub.places.filter(p => p.category !== 'Nightlife');
        const nightlifePlaces = hub.places.filter(p => p.category === 'Nightlife');

        let dayTimeQueue = [...daytimePlaces];
        let nightQueue = [...nightlifePlaces];

        for (let d = 0; d < hub.allocatedDays; d++) {
            const activities = [];
            let cost = 0;

            // Hotel check-in on first day of each hub
            if (d === 0) {
                activities.push({
                    placeId: `CHOOSE_HOTEL_${hub.city}`,
                    type: 'hotel_placeholder',
                    city: hub.city,
                    time: minutesToTimeStr(9 * 60),
                });
            }

            // Smart start time: if only nightlife selected, start day later
            const hasOnlyNight = daytimePlaces.length === 0 && nightlifePlaces.length > 0;
            let currentTime = hasOnlyNight ? 14 * 60 : 9 * 60; // 2 PM or 9 AM

            // -- Daytime activities --
            let placesThisDay = 0;
            let lastPlace = null;
            let lunchAdded = false;

            // Pick up to maxDay places using nearest-neighbor greedy algorithm
            while (dayTimeQueue.length > 0 && placesThisDay < pace.maxDay) {
                // Skip already visited
                dayTimeQueue = dayTimeQueue.filter(p => !visitedIds.has(p.id));
                if (dayTimeQueue.length === 0) break;

                // Nearest neighbor
                let bestIdx = 0;
                if (lastPlace) {
                    let minDist = Infinity;
                    dayTimeQueue.forEach((p, idx) => {
                        const dist = haversineDistance(lastPlace.lat, lastPlace.lng, p.lat, p.lng);
                        if (dist < minDist) { minDist = dist; bestIdx = idx; }
                    });
                }

                const next = dayTimeQueue[bestIdx];
                const transit = lastPlace ? estimateTransit(lastPlace, next, tripStyle) : 20;
                const visitMins = parseDurationHours(next.duration) * 60;

                // Check if fits in daytime
                if (currentTime + transit + visitMins > DAY_END_DAYTIME) {
                    break; // overflow to next day
                }

                // Ideal start time adjustment for first place of day
                if (placesThisDay === 0) {
                    const ideal = getIdealStartHour(next.category) * 60;
                    currentTime = Math.max(currentTime, ideal);
                }

                currentTime += transit;

                // Lunch break (between 12:00 and 14:30)
                if (!lunchAdded && currentTime >= 12 * 60 && currentTime <= 14.5 * 60) {
                    activities.push({ placeId: 'LUNCH', type: 'meal', time: minutesToTimeStr(currentTime), city: hub.city });
                    currentTime += pace.lunchDur;
                    lunchAdded = true;
                }

                activities.push({ placeId: next.id, type: 'place', time: minutesToTimeStr(currentTime) });
                cost += parsePrice(next.price);
                currentTime += visitMins;
                lastPlace = next;
                visitedIds.add(next.id);
                dayTimeQueue.splice(bestIdx, 1);
                placesThisDay++;
            }

            // Add lunch if not yet added and there were activities
            if (!lunchAdded && placesThisDay > 0 && !hasOnlyNight) {
                const lt = Math.max(currentTime, 13 * 60);
                activities.push({ placeId: 'LUNCH', type: 'meal', time: minutesToTimeStr(lt), city: hub.city });
                currentTime = lt + pace.lunchDur;
                lunchAdded = true;
            }

            // Dinner
            const dinnerTime = Math.max(currentTime, 19 * 60);
            activities.push({ placeId: 'DINNER', type: 'meal', time: minutesToTimeStr(dinnerTime), city: hub.city });
            currentTime = dinnerTime + 90;

            // Nightlife - STRICTLY after 22:00
            nightQueue = nightQueue.filter(p => !visitedIds.has(p.id));
            if (nightQueue.length > 0 && travelerType !== 'family') {
                const nightPlace = nightQueue.shift();
                activities.push({
                    placeId: nightPlace.id,
                    type: 'place',
                    time: minutesToTimeStr(NIGHTLIFE_START),
                });
                cost += parsePrice(nightPlace.price);
                visitedIds.add(nightPlace.id);
            }

            // Sort activities by time
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

            totalEstimatedCost += cost;
            if (budgetPerDay > 0 && cost > budgetPerDay) {
                warnings.push(`DAY_OVER_BUDGET_${days.length + 1}`);
            }

            days.push({ activities });
        }
    }

    if (days.length === 0) {
        return { itinerary: null, warnings: ['GENERATION_FAILED'], estimatedCost: 0 };
    }

    const itinerary = {
        name: isRTL ? 'رحلتي الذكية في مصر 🇪🇬' : 'My Smart Egypt Trip 🇪🇬',
        days,
        generatedAt: new Date().toISOString(),
        meta: { travelerType, tripStyle, duration, selectedInterests },
    };

    return { itinerary, warnings, estimatedCost: totalEstimatedCost };
};
