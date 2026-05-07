const fs = require('fs');
const p = fs.readFileSync('c:/Users/Mido/Desktop/EgyptTourismMobile/src/constants/placesData.js', 'utf8');

// The file exports "places". Let's extract it safely without eval, or we can just use eval since it's just an array of objects.
// Wait, the objects have properties like 'name', 'city' etc without quotes.
const match = p.match(/export const places = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('No match');
    process.exit(1);
}

// Convert it to a JS array
let arr;
try {
    arr = eval(match[1]);
} catch(e) {
    console.error(e);
    process.exit(1);
}

const byCity = {};
arr.forEach(item => {
    const c = item.cityEn || 'Other';
    if (!byCity[c]) byCity[c] = [];
    byCity[c].push(item);
});

let newArrStr = 'export const places = [\n';
for (const c in byCity) {
    newArrStr += '    // --- ' + c.toUpperCase() + ' ---\n';
    byCity[c].forEach(item => {
        newArrStr += '    {\n';
        for (const k in item) {
            let v = item[k];
            if (typeof v === 'string') {
                if (v.includes('\n')) {
                    v = '`' + v.replace(/`/g, '\\`') + '`';
                } else {
                    v = "'" + v.replace(/'/g, "\\'") + "'";
                }
            } else if (Array.isArray(v)) {
                v = '[' + v.map(x => {
                    if (typeof x === 'string') return "'" + x.replace(/'/g, "\\'") + "'";
                    return x;
                }).join(', ') + ']';
            } else if (typeof v === 'number' && isNaN(v)) {
                v = 'NaN';
            } else if (v === undefined) {
                continue;
            }
            newArrStr += '        ' + k + ': ' + v + ',\n';
        }
        newArrStr += '    },\n';
    });
}
newArrStr += '];';

const newP = p.replace(/export const places = \[\s*([\s\S]*?)\];/, newArrStr);
fs.writeFileSync('c:/Users/Mido/Desktop/EgyptTourismMobile/src/constants/placesData.js', newP);
console.log('Places data successfully grouped by city.');
