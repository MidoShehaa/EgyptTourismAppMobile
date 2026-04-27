import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Image, Modal, Linking, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING } from '../constants/theme';
import {
  SERVICE_TYPES, VEHICLE_TYPES, FIXED_TRIPS,
  CITY_BASE_RATES, AIRPORTS, INCLUDED_FEATURES
} from '../constants/ridesData';
import { WHATSAPP_NUMBER } from '../constants/config';
import DynamicBackground from '../components/DynamicBackground';

const CITIES = Object.keys(CITY_BASE_RATES);

function calcPrice(serviceType, city, vehicleId, hours, days, fixedTrip) {
  const rates = CITY_BASE_RATES[city] || CITY_BASE_RATES['Cairo'];
  const vehicle = VEHICLE_TYPES.find(v => v.id === vehicleId) || VEHICLE_TYPES[0];
  const m = vehicle.priceMultiplier;
  let base = 0, discountPct = 0;
  if (serviceType === 'hourly') {
    base = rates.hourly * hours * m;
    if (hours >= 6) discountPct = 10;
  } else if (serviceType === 'half_day') {
    base = rates.halfDay * m;
  } else if (serviceType === 'full_day') {
    base = rates.fullDay * m;
  } else if (serviceType === 'airport') {
    base = rates.airportTransfer * m;
  } else if (serviceType === 'multi_day') {
    base = rates.fullDay * days * m;
    discountPct = days >= 5 ? 20 : days >= 3 ? 15 : 10;
  } else if (serviceType === 'fixed_trip' && fixedTrip) {
    base = fixedTrip.basePrice * m;
  }
  const discountAmt = Math.round(base * discountPct / 100);
  return { base: Math.round(base), discountPct, discountAmt, final: Math.round(base - discountAmt) };
}

function bookViaWhatsApp(serviceType, city, vehicle, hours, days, trip, isRTL) {
  const v = VEHICLE_TYPES.find(v => v.id === vehicle);
  const price = calcPrice(serviceType, city, vehicle, hours, days, trip);
  const name = isRTL ? (trip?.nameAr || serviceType) : (trip?.nameEn || serviceType);
  const msg = `🇪🇬 Egypt Tourism App - Booking Request\n\nService: ${name}\nVehicle: ${v?.nameEn}\nCity: ${city || trip?.from}\nTotal: ${price.final.toLocaleString()} EGP\n\nPlease confirm availability.`;
  Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER.replace('+','')}?text=${encodeURIComponent(msg)}`);
}

export default function RidesScreen() {
  const { settings, t } = useUser();
  const isRTL = settings?.language === 'ar';
  const isDark = settings?.darkMode === true;
  const C = isDark ? DARK_COLORS : COLORS;

  const [serviceType, setServiceType] = useState('fixed_trip');
  const [selectedCity, setSelectedCity] = useState('Cairo');
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [hours, setHours] = useState(3);
  const [days, setDays] = useState(2);
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS[0]);
  const [tripModal, setTripModal] = useState(null);

  const price = calcPrice(serviceType, selectedCity, selectedVehicle, hours, days, tripModal);

  const renderServiceChip = ({ item }) => {
    const active = item.id === serviceType;
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: active ? C.primary : C.bgCard, borderWidth: 1, borderColor: active ? C.primary : (C.borderSoft || '#e0e0e0') }
        ]}
        onPress={() => setServiceType(item.id)}
      >
        <Text style={[styles.chipLabel, { color: active ? '#000' : C.textMuted }]}>
          {isRTL ? item.nameAr : item.nameEn}
        </Text>
      </TouchableOpacity>

    );
  };

  const renderVehicle = (v) => {
    const active = v.id === selectedVehicle;
    return (
      <TouchableOpacity
        key={v.id}
        style={[
          styles.vehicleCard,
          { backgroundColor: active ? C.primary : C.bgCard, borderWidth: 1, borderColor: active ? C.primary : (C.borderSoft || '#e0e0e0') }
        ]}
        onPress={() => setSelectedVehicle(v.id)}
      >
        <Text style={styles.vehicleIcon}>{v.icon}</Text>
        <Text style={[styles.vehicleName, { color: active ? '#000' : C.textMain }]}>{isRTL ? v.nameAr : v.nameEn}</Text>
        <Text style={[styles.vehiclePax, { color: active ? 'rgba(0,0,0,0.5)' : C.textMuted }]}>👥 {v.passengers}</Text>
      </TouchableOpacity>

    );
  };

  const renderCityChip = (city) => (
      <TouchableOpacity
      key={city}
      style={[
        styles.cityChip,
        { backgroundColor: selectedCity === city ? C.primary : C.bgCard, borderWidth: 1, borderColor: selectedCity === city ? C.primary : (C.borderSoft || '#e0e0e0') }
      ]}
      onPress={() => setSelectedCity(city)}
    >
      <Text style={[styles.cityChipText, { color: selectedCity === city ? '#000' : C.textMuted }]}>{city}</Text>
    </TouchableOpacity>

  );

  const renderFixedTrip = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => { setTripModal(item); setServiceType('fixed_trip'); }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.tripImage} />
      <View style={styles.tripOverlay} />
      <View style={styles.tripContent}>
        <View style={styles.tripMeta}>
          <View style={[styles.durationBadge, { backgroundColor: C.primary }]}>
            <Text style={styles.durationBadgeText}>{item.durationHours}h</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={C.primary} />
            <Text style={[styles.ratingText, { color: '#fff' }]}> {item.rating}</Text>
          </View>
        </View>
        <Text style={styles.tripName}>{isRTL ? item.nameAr : item.nameEn}</Text>
        <Text style={styles.tripRoute}>📍 {item.from}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.tripPrice, { color: C.primary }]}>{item.basePrice.toLocaleString()} EGP</Text>
          <Ionicons name="arrow-forward-circle" size={24} color={C.primary} />
        </View>
      </View>
    </TouchableOpacity>

  );

  const renderHourStep = (step) => (
    <TouchableOpacity
      key={step}
      style={[styles.stepBtn, { borderWidth: 1, borderColor: hours === step ? C.primary : (C.borderSoft || '#e0e0e0'), backgroundColor: hours === step ? C.gold : C.bgCard }]}
      onPress={() => setHours(step)}
    >
      <Text style={[styles.stepText, { color: hours === step ? '#000' : C.textMain }]}>{step}h</Text>
    </TouchableOpacity>
  );

  const renderDayStep = (step) => (
    <TouchableOpacity
      key={step}
      style={[styles.stepBtn, { borderWidth: 1, borderColor: days === step ? C.primary : (C.borderSoft || '#e0e0e0'), backgroundColor: days === step ? C.gold : C.bgCard }]}
      onPress={() => setDays(step)}
    >
      <Text style={[styles.stepText, { color: days === step ? '#000' : C.textMain }]}>{step}d</Text>
    </TouchableOpacity>
  );

  const PriceBar = ({ serviceId, trip }) => {
    const p = calcPrice(serviceId, selectedCity, selectedVehicle, hours, days, trip);
    return (
      <View style={[styles.priceBar, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }]}>
        <View>
          {p.discountPct > 0 && (
            <Text style={styles.originalPrice}>{p.base.toLocaleString()} EGP</Text>
          )}
          <Text style={[styles.finalPrice, { color: C.textMain }]}>{p.final.toLocaleString()} EGP</Text>
          {p.discountPct > 0 && (
            <Text style={styles.savingText}>-{p.discountPct}% off</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.whatsappBtn, { backgroundColor: C.primary }]}
          onPress={() => bookViaWhatsApp(serviceId, selectedCity, selectedVehicle, hours, days, trip, isRTL)}
        >
          <Text style={styles.whatsappBtnText}>{isRTL ? 'احجز الآن' : 'Book Now'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </TouchableOpacity>
      </View>

    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
      <DynamicBackground city={selectedCity} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textMain }]}>{isRTL ? 'رحلات سياحية' : 'Tourism Rides'}</Text>
        <Text style={[styles.subtitle, { color: C.textMuted }]}>{isRTL ? 'سيارات خاصة مع سائق محترف' : 'Private cars with professional drivers'}</Text>
      </View>

      <FlatList
        data={SERVICE_TYPES}
        horizontal
        keyExtractor={i => i.id}
        renderItem={renderServiceChip}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        style={styles.chipRow}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {serviceType === 'fixed_trip' && (
          <FlatList
            data={FIXED_TRIPS}
            keyExtractor={i => i.id}
            renderItem={renderFixedTrip}
            scrollEnabled={false}
          />
        )}

        {serviceType !== 'fixed_trip' && (
          <>
            {serviceType !== 'airport' && (
              <>
                <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'اختر المدينة' : 'SELECT CITY'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
                  {CITIES.map(renderCityChip)}
                </ScrollView>
              </>
            )}

            {serviceType === 'airport' && (
              <>
                <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'اختر المطار' : 'SELECT AIRPORT'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
                  {AIRPORTS.map(ap => (
                    <TouchableOpacity
                      key={ap.id}
                      style={[styles.airportChip, { borderColor: '#000', backgroundColor: selectedAirport.id === ap.id ? '#000' : C.bgCard }]}
                      onPress={() => { setSelectedAirport(ap); setSelectedCity(ap.city); }}
                    >
                      <Text style={{ fontSize: 18 }}>✈️</Text>
                      <Text style={[styles.airportCode, { color: selectedAirport.id === ap.id ? C.gold : C.textMain }]}>{ap.id}</Text>
                      <Text style={[styles.airportName, { color: selectedAirport.id === ap.id ? '#fff' : C.textMuted }]}>
                        {isRTL ? ap.nameAr : ap.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {serviceType === 'hourly' && (
              <>
                <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'عدد الساعات' : 'NUMBER OF HOURS'}</Text>
                <View style={styles.stepRow}>
                  {[1,2,3,4,5,6,8,10,12].map(renderHourStep)}
                </View>
              </>
            )}

            {serviceType === 'multi_day' && (
              <>
                <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'عدد الأيام' : 'NUMBER OF DAYS'}</Text>
                <View style={styles.stepRow}>
                  {[2,3,4,5,6,7].map(renderDayStep)}
                </View>
                <View style={[styles.discountNotice, { backgroundColor: isDark ? '#1a2800' : '#f0fff0', borderColor: '#4CAF50' }]}>
                  <Text style={{ color: '#4CAF50', fontWeight: '800', fontSize: 13 }}>
                    🎉 {days >= 5 ? '20%' : days >= 3 ? '15%' : '10%'} {isRTL ? 'خصم مضمون!' : 'Discount Applied!'}
                  </Text>
                </View>
              </>
            )}

            <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'نوع السيارة' : 'VEHICLE TYPE'}</Text>
            <View style={styles.vehicleGrid}>
              {VEHICLE_TYPES.map(renderVehicle)}
            </View>

            <Text style={[styles.sectionLabel, { color: C.textMuted }]}>{isRTL ? 'تشمل الخدمة' : 'WHAT\'S INCLUDED'}</Text>
            <View style={[styles.includesCard, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }]}>
              {INCLUDED_FEATURES.map((f, i) => (
                <View key={i} style={styles.includeRow}>
                  <Ionicons name={f.icon} size={18} color={C.gold} />
                  <Text style={[styles.includeText, { color: C.textMain }]}>{isRTL ? f.textAr : f.textEn}</Text>
                </View>
              ))}
            </View>

            <PriceBar serviceId={serviceType} trip={null} />
          </>
        )}

      </ScrollView>

      {/* Trip Detail Modal */}
      <Modal visible={!!tripModal} animationType="slide" transparent>
        {tripModal && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
              <Image source={{ uri: tripModal.imageUrl }} style={styles.modalImage} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setTripModal(null)}>
                <Ionicons name="close-circle" size={36} color={C.gold} />
              </TouchableOpacity>
              <ScrollView style={{ padding: 20 }}>
                <Text style={[styles.modalTitle, { color: C.textMain }]}>{isRTL ? tripModal.nameAr : tripModal.nameEn}</Text>
                <Text style={[styles.modalRoute, { color: C.textMuted }]}>
                  📍 {tripModal.from}{tripModal.to !== tripModal.from ? ` → ${tripModal.to}` : ''} · ⏱ {tripModal.durationHours}h · 🛣 {tripModal.distanceKm}km
                </Text>

                <Text style={[styles.sectionLabel, { color: C.textMuted, marginTop: 16 }]}>{isRTL ? 'محطات التوقف' : 'STOPS'}</Text>
                {tripModal.stops.map((s, i) => (
                  <View key={i} style={styles.stopRow}>
                    <View style={[styles.stopDot, { backgroundColor: C.gold }]} />
                    <Text style={[styles.stopText, { color: C.textMain }]}>{s}</Text>
                  </View>
                ))}

                <Text style={[styles.sectionLabel, { color: C.textMuted, marginTop: 16 }]}>{isRTL ? 'نوع السيارة' : 'VEHICLE TYPE'}</Text>
                <View style={styles.vehicleGrid}>
                  {VEHICLE_TYPES.map(renderVehicle)}
                </View>

                <PriceBar serviceId="fixed_trip" trip={tripModal} />
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  chipRow: { maxHeight: 70 },
  chipList: { paddingHorizontal: 24, gap: 12 },
  chip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 30 },
  chipLabel: { fontSize: 14, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  sectionLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', opacity: 0.6, marginTop: 24, marginBottom: 16 },
  cityRow: { gap: 12 },
  cityChip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 30 },
  cityChipText: { fontWeight: '700', fontSize: 14 },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stepBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(18, 18, 18, 0.6)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  stepText: { fontSize: 14, fontWeight: '900' },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vehicleCard: { width: '48%', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  vehicleIcon: { fontSize: 40, marginBottom: 12 },
  vehicleName: { fontSize: 15, fontWeight: '900' },
  vehiclePax: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  includesCard: { borderRadius: 24, backgroundColor: 'rgba(18, 18, 18, 0.6)', padding: 20, gap: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  includeText: { fontSize: 15, fontWeight: '600' },
  priceBar: { marginTop: 30, borderRadius: 30, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  originalPrice: { color: '#555', fontSize: 14, textDecorationLine: 'line-through' },
  finalPrice: { fontSize: 28, fontWeight: '900' },
  savingText: { color: '#4CD8D0', fontSize: 12, fontWeight: '700' },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20, gap: 10 },
  whatsappBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  tripCard: { height: 280, borderRadius: 32, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  tripImage: { position: 'absolute', width: '100%', height: '100%' },
  tripOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
  tripContent: { flex: 1, padding: 24, justifyContent: 'flex-end' },
  tripMeta: { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', top: 24, left: 24, right: 24 },
  durationBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  durationBadgeText: { fontSize: 12, fontWeight: '900', color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ratingText: { fontSize: 12, fontWeight: '900' },
  tripName: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  tripRoute: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripPrice: { fontSize: 20, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  modalContent: { flex: 1 },
  modalImage: { width: '100%', height: 350 },
  modalClose: { position: 'absolute', top: 50, right: 24 },
  modalTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  modalRoute: { fontSize: 15, fontWeight: '600', marginBottom: 24, opacity: 0.6 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stopDot: { width: 12, height: 12, borderRadius: 6 },
  stopText: { fontSize: 16, fontWeight: '600' },
});

