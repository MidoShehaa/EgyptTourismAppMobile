const fs = require('fs');

// Simple mock for places and hotels based on the project structure
// Since we can't easily import ES6 modules directly in Node without babel, we'll read and eval them simply
const placesCode = fs.readFileSync('./src/constants/placesData.js', 'utf8');
const hotelsCode = fs.readFileSync('./src/constants/hotelsData.js', 'utf8');

// Strip export const and just evaluate them
const placesEval = placesCode.replace(/export const CATEGORIES/g, 'var CATEGORIES').replace(/export const places/g, 'var places');
const hotelsEval = hotelsCode.replace(/export const HOTELS/g, 'var HOTELS');

eval(placesEval);
eval(hotelsEval);

const selectedInterests = ['Pharaonic', 'Cultural'];
const duration = 3;

const generateTrip = () => {
    const interestedPlaces = places.filter(p => selectedInterests.includes(p.category));
    
    const cityGroups = {};
    interestedPlaces.forEach(p => {
        if (!cityGroups[p.cityEn]) cityGroups[p.cityEn] = [];
        cityGroups[p.cityEn].push(p);
    });

    const cities = Object.keys(cityGroups).sort((a, b) => cityGroups[b].length - cityGroups[a].length);
    
    let currentCityIndex = 0;
    let visitedPlaceIds = new Set();
    let currentCity = cities[currentCityIndex];
    let placesInCurrentCity = [...cityGroups[currentCity]].sort((a, b) => b.rating - a.rating);

    const newItinerary = { name: 'My Perfect Trip', days: [] };

    for (let d = 1; d <= duration; d++) {
        let activities = [];
        
        if (placesInCurrentCity.length === 0 || (d > 1 && (d - 1) % 3 === 0 && currentCityIndex < cities.length - 1)) {
            currentCityIndex = (currentCityIndex + 1) % cities.length;
            currentCity = cities[currentCityIndex];
            placesInCurrentCity = cityGroups[currentCity] ? [...cityGroups[currentCity]].sort((a, b) => b.rating - a.rating) : [];
        }

        if (d === 1 || (d > 1 && (d - 1) % 3 === 0)) {
            const cityHotels = HOTELS.filter(h => h.city === currentCity);
            if (cityHotels.length > 0) {
                const bestHotel = cityHotels.sort((a, b) => b.rating - a.rating)[0];
                activities.push({
                    placeId: bestHotel.id,
                    type: 'hotel',
                    time: "10:00 AM",
                    name: bestHotel.name
                });
            }
        }

        const morningPlace = placesInCurrentCity.find(p => !visitedPlaceIds.has(p.id));
        if (morningPlace) {
            visitedPlaceIds.add(morningPlace.id);
            activities.push({
                placeId: morningPlace.id,
                type: 'place',
                time: activities.length > 0 ? "11:30 AM" : "10:00 AM",
                name: morningPlace.nameEn
            });
        }

        activities.push({
            placeId: 'LUNCH',
            type: 'meal',
            time: "01:30 PM",
            name: "Local Lunch"
        });

        const afternoonPlace = placesInCurrentCity.find(p => !visitedPlaceIds.has(p.id));
        if (afternoonPlace) {
            visitedPlaceIds.add(afternoonPlace.id);
            activities.push({
                placeId: afternoonPlace.id,
                type: 'place',
                time: "03:30 PM",
                name: afternoonPlace.nameEn
            });
        }

        const eveningPlace = placesInCurrentCity.find(p => !visitedPlaceIds.has(p.id) && (p.category === 'Nightlife' || p.category === 'Cultural'));
        if (eveningPlace) {
            visitedPlaceIds.add(eveningPlace.id);
            activities.push({
                placeId: eveningPlace.id,
                type: 'place',
                time: "07:00 PM",
                name: eveningPlace.nameEn
            });
        } else {
            activities.push({
                placeId: 'DINNER',
                type: 'meal',
                time: "08:00 PM",
                name: "Fine Dinner"
            });
        }

        if (activities.length > 0) newItinerary.days.push({ activities });
    }
    return newItinerary;
};

console.log(JSON.stringify(generateTrip(), null, 2));
