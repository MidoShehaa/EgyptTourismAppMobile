import React from 'react';
import PharaonicBackground from './PharaonicBackground';
import IslamicBackground from './IslamicBackground';
import CoastalBackground from './CoastalBackground';
import DivingBackground from './DivingBackground';

export default function DynamicBackground({ category, city }) {
    
    const getTheme = () => {
        const catLower = (category || '').toLowerCase();
        const cityLower = (city || '').toLowerCase();

        // 1. Direct category match
        if (catLower.includes('islamic')) return 'islamic';
        if (catLower.includes('diving')) return 'diving';
        if (catLower.includes('beach') || catLower.includes('nature') || catLower.includes('medical')) return 'coastal';
        if (catLower.includes('pharaonic') || catLower.includes('cultural') || catLower.includes('christian')) return 'pharaonic';
        if (catLower.includes('nightlife')) return 'islamic'; // dark/moody fits nightlife

        // 2. City fallback
        if (cityLower.includes('sharm') || cityLower.includes('hurghada') ||
            cityLower.includes('dahab') || cityLower.includes('gouna') ||
            cityLower.includes('safaga') || cityLower.includes('matrouh')) {
            return 'coastal';
        }
        if (cityLower.includes('cairo') || cityLower.includes('alexandria') ||
            cityLower.includes('zayed') || cityLower.includes('new cairo')) {
            return 'islamic';
        }
        if (cityLower.includes('luxor') || cityLower.includes('aswan') ||
            cityLower.includes('sohag') || cityLower.includes('farafra') ||
            cityLower.includes('fayoum')) {
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
