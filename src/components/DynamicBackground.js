import React from 'react';
import PharaonicBackground from './PharaonicBackground';
import IslamicBackground from './IslamicBackground';
import CoastalBackground from './CoastalBackground';
import DivingBackground from './DivingBackground';

export default function DynamicBackground({ category, city }) {
    
    const getTheme = () => {
        const catLower = (category || '').toLowerCase();
        const cityLower = (city || '').toLowerCase();

        // 1. Check direct categories first
        if (catLower.includes('islamic')) return 'islamic';
        if (catLower.includes('diving')) return 'diving';
        if (catLower.includes('beach') || catLower.includes('nature')) return 'coastal';
        if (catLower.includes('pharaonic') || catLower.includes('cultural')) return 'pharaonic';

        // 2. Check cities if category doesn't give a strong signal
        if (cityLower.includes('sharm') || cityLower.includes('hurghada') || cityLower.includes('dahab')) {
            return 'coastal';
        }
        if (cityLower.includes('cairo') || cityLower.includes('alexandria')) {
            return 'islamic'; // Or pharaonic, but let's mix it up
        }
        if (cityLower.includes('luxor') || cityLower.includes('aswan')) {
            return 'pharaonic';
        }

        // Default
        return 'pharaonic';
    };

    const theme = getTheme();

    switch (theme) {
        case 'islamic':
            return <IslamicBackground />;
        case 'diving':
            return <DivingBackground />;
        case 'coastal':
            return <CoastalBackground />;
        case 'pharaonic':
        default:
            return <PharaonicBackground />;
    }
}
