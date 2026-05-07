import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// City coordinates for Open-Meteo (free, no API key needed)
const CITY_COORDS = {
    'Cairo':          { lat: 30.0444, lng: 31.2357 },
    'القاهرة':        { lat: 30.0444, lng: 31.2357 },
    'Giza':           { lat: 29.9870, lng: 31.2118 },
    'الجيزة':         { lat: 29.9870, lng: 31.2118 },
    'Alexandria':     { lat: 31.2001, lng: 29.9187 },
    'الإسكندرية':     { lat: 31.2001, lng: 29.9187 },
    'Luxor':          { lat: 25.6872, lng: 32.6396 },
    'الأقصر':         { lat: 25.6872, lng: 32.6396 },
    'Aswan':          { lat: 24.0889, lng: 32.8998 },
    'أسوان':          { lat: 24.0889, lng: 32.8998 },
    'Sharm El Sheikh': { lat: 27.9158, lng: 34.3300 },
    'شرم الشيخ':      { lat: 27.9158, lng: 34.3300 },
    'Hurghada':       { lat: 27.2579, lng: 33.8116 },
    'الغردقة':        { lat: 27.2579, lng: 33.8116 },
    'Dahab':          { lat: 28.5091, lng: 34.5131 },
    'دهب':            { lat: 28.5091, lng: 34.5131 },
    'Siwa':           { lat: 29.2032, lng: 25.5195 },
    'سيوة':           { lat: 29.2032, lng: 25.5195 },
    'Fayoum':         { lat: 29.3084, lng: 30.8428 },
    'الفيوم':         { lat: 29.3084, lng: 30.8428 },
    'Marsa Alam':     { lat: 25.0673, lng: 34.8990 },
    'مرسى علم':       { lat: 25.0673, lng: 34.8990 },
    'Marsa Matrouh':  { lat: 31.3543, lng: 27.2373 },
    'مرسى مطروح':     { lat: 31.3543, lng: 27.2373 },
    'Nuweiba':        { lat: 28.9824, lng: 34.6607 },
    'نويبع':          { lat: 28.9824, lng: 34.6607 },
    'Ras El Bar':     { lat: 31.5167, lng: 31.8333 },
    'رأس البر':       { lat: 31.5167, lng: 31.8333 },
    'Sahel Hashish':  { lat: 27.1247, lng: 33.8390 },
    'سهل حشيش':       { lat: 27.1247, lng: 33.8390 },
    'North Coast':    { lat: 30.9500, lng: 28.9500 },
    'الساحل الشمالي': { lat: 30.9500, lng: 28.9500 },
};

const WMO_CODES = {
    0: { icon: 'sunny',           label: 'Clear Sky',          labelAr: 'سماء صافية' },
    1: { icon: 'sunny',           label: 'Mostly Clear',       labelAr: 'صافية غالباً' },
    2: { icon: 'partly-sunny',    label: 'Partly Cloudy',      labelAr: 'غائمة جزئياً' },
    3: { icon: 'cloudy',          label: 'Overcast',           labelAr: 'غائمة' },
    45:{ icon: 'cloud',           label: 'Foggy',              labelAr: 'ضبابية' },
    48:{ icon: 'cloud',           label: 'Foggy',              labelAr: 'ضبابية' },
    51:{ icon: 'rainy',           label: 'Light Drizzle',      labelAr: 'رذاذ خفيف' },
    53:{ icon: 'rainy',           label: 'Drizzle',            labelAr: 'رذاذ' },
    55:{ icon: 'rainy',           label: 'Heavy Drizzle',      labelAr: 'رذاذ كثيف' },
    61:{ icon: 'rainy',           label: 'Light Rain',         labelAr: 'مطر خفيف' },
    63:{ icon: 'rainy',           label: 'Rain',               labelAr: 'مطر' },
    65:{ icon: 'thunderstorm',    label: 'Heavy Rain',         labelAr: 'مطر غزير' },
    80:{ icon: 'rainy',           label: 'Rain Showers',       labelAr: 'زخات مطر' },
    95:{ icon: 'thunderstorm',    label: 'Thunderstorm',       labelAr: 'عاصفة رعدية' },
};

const getSmartTip = (temp, weatherCode, isRTL) => {
    if (temp >= 40) return isRTL ? '🔥 حار جداً — اشرب ماء كثير وتجنب الشمس من 11 ل 3' : '🔥 Extremely hot — drink plenty of water, avoid sun 11AM-3PM';
    if (temp >= 35) return isRTL ? '☀️ حار — استخدم واقي شمس وقبعة' : '☀️ Hot — use sunscreen & a hat';
    if (temp >= 25) return isRTL ? '😊 طقس مثالي للتنزه!' : '😊 Perfect weather for sightseeing!';
    if (temp >= 15) return isRTL ? '🧥 معتدل — أحضر جاكيت خفيف' : '🧥 Mild — bring a light jacket';
    if (temp < 15)  return isRTL ? '❄️ بارد — البس ملابس ثقيلة' : '❄️ Cold — dress warmly';
    return '';
};

export default function WeatherWidget({ city, colors, isRTL }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const C = colors;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const coords = CITY_COORDS[city] || CITY_COORDS['Cairo'];
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Africa%2FCairo`;
                const response = await fetch(url);
                const data = await response.json();
                if (data?.current) {
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        code: data.current.weather_code,
                        humidity: data.current.relative_humidity_2m,
                        wind: Math.round(data.current.wind_speed_10m),
                    });
                }
            } catch (e) {
                // Silently fail — widget just won't show
                console.log('Weather fetch failed:', e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [city]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: C.bgElevated }]}>
                <ActivityIndicator size="small" color={C.primary} />
            </View>
        );
    }

    if (!weather) return null;

    const wmo = WMO_CODES[weather.code] || WMO_CODES[0];
    const tip = getSmartTip(weather.temp, weather.code, isRTL);

    return (
        <View style={[styles.container, { backgroundColor: C.bgElevated, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.iconBlock}>
                <Ionicons name={wmo.icon} size={36} color={C.primary} />
            </View>
            <View style={[styles.info, isRTL ? { paddingRight: 16 } : { paddingLeft: 16 }]}>
                <View style={[styles.topRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.temp, { color: C.textMain }]}>{weather.temp}°C</Text>
                    <Text style={[styles.desc, { color: C.textMuted }]}>{isRTL ? wmo.labelAr : wmo.label}</Text>
                </View>
                <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.statItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="water-outline" size={14} color={C.textMuted} />
                        <Text style={[styles.statText, { color: C.textMuted }]}>{weather.humidity}%</Text>
                    </View>
                    <View style={[styles.statItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="speedometer-outline" size={14} color={C.textMuted} />
                        <Text style={[styles.statText, { color: C.textMuted }]}>{weather.wind} km/h</Text>
                    </View>
                </View>
                {tip ? <Text style={[styles.tip, { color: C.primary }, isRTL && { textAlign: 'right' }]}>{tip}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBlock: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,215,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    temp: {
        fontSize: 28,
        fontWeight: '900',
    },
    desc: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tip: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },
});
