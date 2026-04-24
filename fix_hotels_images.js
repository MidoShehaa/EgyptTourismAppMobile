const fs = require('fs');
const path = 'src/constants/hotelsData.js';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    { name: 'Four Seasons Cairo at Nile Plaza', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nile_river_at_night_%28Cairo%29.jpg/800px-Nile_river_at_night_%28Cairo%29.jpg' },
    { name: 'The Ritz-Carlton, Cairo', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Nile_Ritz-Carlton_Cairo.jpg/800px-Nile_Ritz-Carlton_Cairo.jpg' },
    { name: 'Steigenberger Alcazar', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sharm_el_Sheikh_Sunrise.jpg/800px-Sharm_el_Sheikh_Sunrise.jpg' },
    { name: 'Lazib Inn Resort', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wadi_El_Rayan_lake.jpg/800px-Wadi_El_Rayan_lake.jpg' },
    { name: 'Rixos Sharm El Sheikh', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ras_Mohammed_National_Park.jpg/800px-Ras_Mohammed_National_Park.jpg' },
    { name: 'Sofitel Legend Old Cataract', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Old_Cataract_Hotel.jpg/800px-Old_Cataract_Hotel.jpg' },
    { name: 'Marriott Mena House', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Mena_House_Hotel%2C_Giza.jpg/800px-Mena_House_Hotel%2C_Giza.jpg' },
    { name: 'Kempinski Nile Hotel', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cairo_skyline%2C_Egypt.jpg/800px-Cairo_skyline%2C_Egypt.jpg' },
    { name: 'Mercure Hurghada', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hurghada_-_panorama.jpg/800px-Hurghada_-_panorama.jpg' },
    { name: 'Life Pyramids Inn', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/800px-All_Gizah_Pyramids.jpg' },
    { name: 'Marvel Stone Hotel', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Great_Sphinx_of_Giza_%282023%29_2.jpg/800px-Great_Sphinx_of_Giza_%282023%29_2.jpg' },
    { name: 'Heritage Hostel Cairo', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Tahrir_Square%2C_Cairo%2C_Egypt.jpg/800px-Tahrir_Square%2C_Cairo%2C_Egypt.jpg' },
    { name: 'Cairo Hub', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Qasr_El_Nil_Bridge.jpg/800px-Qasr_El_Nil_Bridge.jpg' },
    { name: 'Rafiki Hostels', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Dahab_lagoon.jpg/800px-Dahab_lagoon.jpg' },
    { name: 'Basata Eco-Lodge', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Nuweiba_beach.jpg/800px-Nuweiba_beach.jpg' },
    { name: 'Beit Tolba', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nuweiba_Coast.jpg/800px-Nuweiba_Coast.jpg' },
    { name: 'Ithaka Hostel', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Alexandria_Corniche.jpg/800px-Alexandria_Corniche.jpg' },
    { name: 'Pajama Hostel Nile View', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Elephantine_Island_from_the_Nile.jpg/800px-Elephantine_Island_from_the_Nile.jpg' },
    { name: 'Kato Dool', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nubian_village_Aswan.jpg/800px-Nubian_village_Aswan.jpg' },
    { name: 'Sofia Guest House', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Luxor_Temple_Egypt1.jpg/800px-Luxor_Temple_Egypt1.jpg' },
    { name: 'Bob Marley Peace Hotel', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Valley_of_the_Kings_panorama.jpg/800px-Valley_of_the_Kings_panorama.jpg' }
];

let updatedContent = content;
const hotels = updatedContent.split('id:');

for (let i = 1; i < hotels.length; i++) {
    const section = hotels[i];
    const nameMatch = section.match(/name:\s*'([^']+)'/);
    if (nameMatch) {
        const hotelName = nameMatch[1];
        const match = replacements.find(r => hotelName.includes(r.name));
        if (match) {
            hotels[i] = section.replace(/image:\s*'[^']+'/, `image: '${match.img}'`);
        } else {
            // Default to a realistic image rather than pexels
            hotels[i] = section.replace(/image:\s*'[^']+'/, `image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/800px-All_Gizah_Pyramids.jpg'`);
        }
    }
}

fs.writeFileSync(path, hotels.join('id:'), 'utf8');
console.log('Hotels images updated successfully');
