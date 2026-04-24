const fs = require('fs');
const path = require('path');

const safeImages = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Nile_River_and_Cairo_Tower.jpg/800px-Nile_River_and_Cairo_Tower.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/800px-All_Gizah_Pyramids.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Khan_el-Khalili.jpg/800px-Khan_el-Khalili.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Karnak_Temple_Complex.jpg/800px-Karnak_Temple_Complex.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ras_Mohammed_National_Park.jpg/800px-Ras_Mohammed_National_Park.jpg'
];

const files = [
    'src/screens/HotelsScreen.js',
    'src/screens/ExperiencesScreen.js',
    'src/screens/OnboardingScreen.js',
    'src/screens/PlannerScreen.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        let match;
        const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^'"]+/g;
        
        // Replace each occurrence with a random or round-robin image from safeImages
        let index = 0;
        content = content.replace(regex, () => {
            const img = safeImages[index % safeImages.length];
            index++;
            return img;
        });
        
        fs.writeFileSync(fullPath, content);
        console.log('Fixed Unsplash images in ' + file);
    } else {
        console.log('File not found: ' + file);
    }
});
