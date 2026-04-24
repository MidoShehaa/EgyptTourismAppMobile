const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'constants', 'placesData.js');
let content = fs.readFileSync(file, 'utf8');

const mapping = {
    1: 'https://images.unsplash.com/photo-1539667468225-eebb663053e6?auto=format&fit=crop&w=800&q=80',
    2: 'https://images.unsplash.com/photo-1599395726262-e19efc8c1606?auto=format&fit=crop&w=800&q=80',
    3: 'https://images.unsplash.com/photo-1588698284534-192a39d257a6?auto=format&fit=crop&w=800&q=80',
    4: 'https://images.unsplash.com/photo-1503177847378-d20485989ed1?auto=format&fit=crop&w=800&q=80',
    5: 'https://images.unsplash.com/photo-1589330960570-8e10d2bc43eb?auto=format&fit=crop&w=800&q=80',
    6: 'https://images.unsplash.com/photo-1627308595229-7830f5c9c66e?auto=format&fit=crop&w=800&q=80',
    7: 'https://images.unsplash.com/photo-1620108994784-07dcc2643a6d?auto=format&fit=crop&w=800&q=80',
    8: 'https://images.unsplash.com/photo-1549444383-7d72d62269a8?auto=format&fit=crop&w=800&q=80',
    9: 'https://images.unsplash.com/photo-1682687982501-1e58f814713e?auto=format&fit=crop&w=800&q=80',
    10: 'https://images.unsplash.com/photo-1682695796254-12bf20c0eff2?auto=format&fit=crop&w=800&q=80',
    11: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    12: 'https://images.unsplash.com/photo-1582264663583-8a3dcb1a91e5?auto=format&fit=crop&w=800&q=80',
    13: 'https://images.unsplash.com/photo-1590483259885-b82aa2585db9?auto=format&fit=crop&w=800&q=80',
    14: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    15: 'https://images.unsplash.com/photo-1470229722913-7c090be5c5a5?auto=format&fit=crop&w=800&q=80',
    16: 'https://images.unsplash.com/photo-1601006509493-9c869fb8bcbe?auto=format&fit=crop&w=800&q=80',
    17: 'https://images.unsplash.com/photo-1581454178385-2e63c0a5b82c?auto=format&fit=crop&w=800&q=80',
    18: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    19: 'https://images.unsplash.com/photo-1614769018674-d4be108fb2a6?auto=format&fit=crop&w=800&q=80',
    20: 'https://images.unsplash.com/photo-1533038590840-1cbea6a632c4?auto=format&fit=crop&w=800&q=80',
    21: 'https://images.unsplash.com/photo-1585822765355-6b5d92e85ab8?auto=format&fit=crop&w=800&q=80',
    22: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
    23: 'https://images.unsplash.com/photo-1510250625688-de8e8d8ee438?auto=format&fit=crop&w=800&q=80',
    24: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
};

for (const [id, url] of Object.entries(mapping)) {
    const r = new RegExp(`(id:\\s*${id},[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
    content = content.replace(r, `$1${url}$2`);
}

fs.writeFileSync(file, content);
console.log('Replaced all URLs with Unsplash CDN images.');
