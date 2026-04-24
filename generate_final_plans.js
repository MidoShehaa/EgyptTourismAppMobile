const regions = [
    { name: 'القاهرة والجيزة', nameEn: 'Cairo & Giza', places: [1, 3, 4] },
    { name: 'الأقصر وأسوان', nameEn: 'Luxor & Aswan', places: [2, 6, 7, 8] },
    { name: 'دهب وشرم الشيخ', nameEn: 'Dahab & Sharm', places: [5, 9] },
    { name: 'سانت كاترين', nameEn: 'St. Catherine', places: [11, 12] },
    { name: 'القدس والبتراء', nameEn: 'Jerusalem & Petra', places: [13, 14] }
];

const masterPlans = [
    {
        "id": "master-1",
        "title": "مسار الأنبياء (القاهرة - سيناء - القدس - الأردن)",
        "titleEn": "Prophets' Trail: Cairo - Sinai - Jerusalem - Jordan",
        "days": 12,
        "rating": 5.0,
        "image": "https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F2%2F20%2FJerusalem_Old_City_View.jpg%2F800px-Jerusalem_Old_City_View.jpg",
        "description": "رحلة العمر الروحانية التي تتبع خطى الأنبياء عبر 3 دول.",
        "descriptionEn": "A spiritual journey of a lifetime tracing the footsteps of prophets across 3 countries.",
        "plan": {
            "days": [
                { "activities": [{ "placeId": 3, "type": "place", "time": "10:00 AM" }, { "placeId": 4, "type": "place", "time": "03:00 PM" }] },
                { "activities": [{ "placeId": 11, "type": "place", "time": "04:00 PM" }] },
                { "activities": [{ "placeId": 12, "type": "place", "time": "02:00 AM" }, { "placeId": 11, "type": "place", "time": "10:00 AM" }] },
                { "activities": [{ "placeId": 13, "type": "place", "time": "09:00 AM" }] },
                { "activities": [{ "placeId": 14, "type": "place", "time": "08:00 AM" }] }
            ]
        }
    },
    {
        "id": "master-2",
        "title": "قمم وأعماق سيناء (هايكنج وغوص)",
        "titleEn": "Sinai Summits & Depths (Hiking & Diving)",
        "days": 7,
        "rating": 4.9,
        "image": "https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F2%2F2b%2FMount_Sinai_Summit.jpg%2F800px-Mount_Sinai_Summit.jpg",
        "description": "مغامرة لا تنسى تجمع بين تسلق أعلى قمم مصر والغوص في أعمق ثقوبها الزرقاء.",
        "descriptionEn": "An unforgettable adventure combining hiking Egypt's highest peaks and diving into its deepest blue holes.",
        "plan": {
            "days": [
                { "activities": [{ "placeId": 12, "type": "place", "time": "02:00 AM" }] },
                { "activities": [{ "placeId": 9, "type": "place", "time": "10:00 AM" }] },
                { "activities": [{ "placeId": 5, "type": "place", "time": "09:00 AM" }] }
            ]
        }
    }
];

const plans = [...masterPlans];

// Generate variations to reach 50
for (let i = 1; i <= 48; i++) {
    const region = regions[i % regions.length];
    const days = 2 + (i % 6);
    plans.push({
        id: `plan-${i}`,
        title: `${region.name}: جولة رقم ${i}`,
        titleEn: `${region.nameEn}: Tour #${i}`,
        days: days,
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        image: `https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Faf%2FAll_Gizah_Pyramids.jpg%2F800px-All_Gizah_Pyramids.jpg`, 
        description: `خطة مخصصة لاستكشاف ${region.name} على مدار ${days} أيام.`,
        descriptionEn: `Customized plan to explore ${region.nameEn} over ${days} days.`,
        plan: {
            days: Array.from({length: days}, (_, d) => ({
                activities: [{ placeId: region.places[d % region.places.length], type: 'place', time: '09:00 AM' }]
            }))
        }
    });
}

const content = `export const SUGGESTED_PLANS = ${JSON.stringify(plans, null, 4)};`;
require('fs').writeFileSync('src/constants/itinerarySuggestions.js', content);
console.log('50 suggested plans with master itineraries generated');
