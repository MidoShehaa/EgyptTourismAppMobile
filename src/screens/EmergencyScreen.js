import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSettings } from '../store/SettingsContext';
import { COLORS, DARK_COLORS, getFontFamily } from '../constants/theme';
import DynamicBackground from '../components/DynamicBackground';

const EMERGENCY_NUMBERS = [
    { id: 'police',      number: '122', icon: 'shield-checkmark', nameEn: 'Police',              nameAr: 'الشرطة',          color: '#4A90D9' },
    { id: 'ambulance',   number: '123', icon: 'medkit',           nameEn: 'Ambulance',            nameAr: 'الإسعاف',         color: '#E74C3C' },
    { id: 'fire',        number: '180', icon: 'flame',            nameEn: 'Fire Department',      nameAr: 'المطافئ',         color: '#E67E22' },
    { id: 'tourPolice',  number: '126', icon: 'people',           nameEn: 'Tourist Police',       nameAr: 'شرطة السياحة',    color: '#2ECC71' },
    { id: 'roadHelp',    number: '01221110000', icon: 'car',      nameEn: 'Road Assistance',      nameAr: 'نجدة الطريق',     color: '#9B59B6' },
    { id: 'electricFault',number:'121', icon: 'flash',            nameEn: 'Electricity Emergency', nameAr: 'أعطال الكهرباء',  color: '#F1C40F' },
];

const EMBASSIES = [
    { country: 'USA 🇺🇸',          phone: '+20-2-27973300',  address: '5 Tawfik Diab St, Garden City, Cairo' },
    { country: 'UK 🇬🇧',           phone: '+20-2-27916000',  address: '7 Ahmed Ragheb St, Garden City, Cairo' },
    { country: 'Germany 🇩🇪',      phone: '+20-2-27282000',  address: '2 Berlin Street, Zamalek, Cairo' },
    { country: 'France 🇫🇷',       phone: '+20-2-35673200',  address: '29 Giza St, Giza' },
    { country: 'Italy 🇮🇹',        phone: '+20-2-27943194',  address: '15 Abdel Rahman Fahmy St, Garden City' },
    { country: 'Saudi Arabia 🇸🇦',  phone: '+20-2-27607388',  address: 'Giza, Cairo' },
    { country: 'UAE 🇦🇪',          phone: '+20-2-27394444',  address: '4 Ibn Sina St, Giza' },
];

const SAFETY_TIPS_EN = [
    '🚕 Always use metered taxis (white ones) or Uber/Careem — avoid unmarked cars.',
    '💧 Drink bottled water only. Tap water is not safe for drinking.',
    '🏛️ Keep a copy of your passport in your phone and in your hotel safe.',
    '💰 Negotiate prices BEFORE services (horse rides, boat rides, guides).',
    '👗 Dress modestly when visiting mosques and religious sites — cover shoulders & knees.',
    '📱 Keep valuables in your front pocket in crowded areas like Khan El-Khalili.',
    '🌡️ Carry sunscreen, hat, and water in Upper Egypt (Luxor/Aswan) — temperatures can exceed 45°C.',
    '🏪 Shops & services may close during Friday noon prayers (12-2 PM).',
    '💳 Cash is king — many local shops don\'t accept cards. ATMs are widely available.',
    '🤝 Tipping (baksheesh) is customary. 10-15% at restaurants, 5-10 EGP for small services.',
];

const SAFETY_TIPS_AR = [
    '🚕 استخدم التاكسي الأبيض أو أوبر/كريم دائماً — تجنب السيارات غير المسجلة.',
    '💧 اشرب مياه معبأة فقط. مياه الصنبور غير آمنة للشرب.',
    '🏛️ احتفظ بنسخة من جواز سفرك في هاتفك وفي خزنة الفندق.',
    '💰 تفاوض على الأسعار قبل أي خدمة (ركوب الخيل، القوارب، المرشدين).',
    '👗 ارتدِ ملابس محتشمة عند زيارة المساجد والأماكن الدينية.',
    '📱 احتفظ بأغراضك الثمينة في الجيوب الأمامية في المناطق المزدحمة.',
    '🌡️ احمل واقي شمس وقبعة ومياه في صعيد مصر — الحرارة قد تتجاوز 45°.',
    '🏪 المحلات قد تغلق أثناء صلاة الجمعة (12-2 ظهراً).',
    '💳 النقد هو الملك — كثير من المحلات لا تقبل البطاقات. أجهزة الصراف موجودة.',
    '🤝 البقشيش عادة مصرية. 10-15% في المطاعم، 5-10 جنيه للخدمات الصغيرة.',
];

const MUSEUM_HOURS = [
    { nameEn: 'Egyptian Museum (Tahrir)',     nameAr: 'المتحف المصري (التحرير)',      hours: '09:00 - 17:00',  priceEn: '200 EGP / 450 EGP (mummy room)', priceAr: '200 جنيه / 450 جنيه (غرفة المومياوات)' },
    { nameEn: 'Grand Egyptian Museum (GEM)',  nameAr: 'المتحف المصري الكبير',         hours: '09:00 - 18:00',  priceEn: '600 EGP (foreign) / 60 EGP (local)', priceAr: '600 جنيه (أجنبي) / 60 جنيه (مصري)' },
    { nameEn: 'Luxor Temple',                 nameAr: 'معبد الأقصر',                  hours: '06:00 - 21:00',  priceEn: '260 EGP', priceAr: '260 جنيه' },
    { nameEn: 'Karnak Temple',                nameAr: 'معبد الكرنك',                  hours: '06:00 - 17:30',  priceEn: '300 EGP', priceAr: '300 جنيه' },
    { nameEn: 'Valley of the Kings',          nameAr: 'وادي الملوك',                  hours: '06:00 - 17:00',  priceEn: '400 EGP (3 tombs)', priceAr: '400 جنيه (3 مقابر)' },
    { nameEn: 'Abu Simbel Temples',           nameAr: 'معابد أبو سمبل',               hours: '05:00 - 18:00',  priceEn: '480 EGP', priceAr: '480 جنيه' },
];

const HOLIDAYS = [
    { dateEn: 'Jan 7',       nameEn: 'Coptic Christmas',     nameAr: 'عيد الميلاد المجيد' },
    { dateEn: 'Jan 25',      nameEn: 'Revolution Day',       nameAr: 'عيد الثورة' },
    { dateEn: 'Apr 25',      nameEn: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء' },
    { dateEn: 'May 1',       nameEn: 'Labour Day',           nameAr: 'عيد العمال' },
    { dateEn: 'Jun 30',      nameEn: 'June 30 Revolution',   nameAr: 'ثورة 30 يونيو' },
    { dateEn: 'Jul 23',      nameEn: 'July 23 Revolution',   nameAr: 'ثورة 23 يوليو' },
    { dateEn: 'Oct 6',       nameEn: 'Armed Forces Day',     nameAr: 'عيد القوات المسلحة' },
    { dateEn: 'Varies',      nameEn: 'Eid al-Fitr (3 days)', nameAr: 'عيد الفطر (3 أيام)' },
    { dateEn: 'Varies',      nameEn: 'Eid al-Adha (4 days)', nameAr: 'عيد الأضحى (4 أيام)' },
];

const VISA_INFO_EN = `Most nationalities can obtain a visa on arrival at Egyptian airports for $25 USD (single entry) or $60 USD (multiple entry). E-visa is available at visa2egypt.gov.eg. Passport must be valid for 6+ months. Citizens of some countries (e.g., Malaysia, South Korea, Hong Kong) get visa-free entry for 30 days.`;

const VISA_INFO_AR = `معظم الجنسيات يمكنها الحصول على تأشيرة عند الوصول بالمطارات المصرية مقابل 25$ (دخول واحد) أو 60$ (دخول متعدد). التأشيرة الإلكترونية متاحة على visa2egypt.gov.eg. جواز السفر يجب أن يكون صالحاً لأكثر من 6 أشهر. مواطنو بعض الدول (ماليزيا، كوريا الجنوبية، هونغ كونغ) يحصلون على إعفاء من التأشيرة لمدة 30 يوماً.`;

export default function EmergencyScreen({ navigation }) {
    const { settings, t } = useSettings();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const callNumber = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const renderSection = (title, icon, children, index) => (
        <Animated.View entering={FadeInDown.delay(index * 150).duration(500)} style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name={icon} size={22} color={C.primary} />
                <Text style={[styles.sectionTitle, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{title}</Text>
            </View>
            {children}
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('practicalInfo') || 'Practical Info'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Emergency Numbers */}
                {renderSection(
                    '📞 ' + (t('emergencyNumbers') || 'Emergency Numbers'),
                    'call-outline',
                    <View style={styles.emergencyGrid}>
                        {EMERGENCY_NUMBERS.map((item, idx) => (
                            <Animated.View entering={ZoomIn.delay(idx * 100).duration(400)} key={item.id} style={{ width: '48%' }}>
                                <TouchableOpacity
                                    style={[styles.emergencyCard, { backgroundColor: C.bgCard, width: '100%' }]}
                                    onPress={() => callNumber(item.number)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.emergencyIconCircle, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon} size={24} color={item.color} />
                                    </View>
                                    <Text style={[styles.emergencyName, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{isRTL ? item.nameAr : item.nameEn}</Text>
                                    <Text style={[styles.emergencyNumber, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{item.number}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>,
                    1
                )}

                {/* Visa Information */}
                {renderSection(
                    '🛂 ' + (t('visaInformation') || 'Visa Information'),
                    'document-text-outline',
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.infoText, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'medium') }, isRTL && { textAlign: 'right' }]}>
                            {isRTL ? VISA_INFO_AR : VISA_INFO_EN}
                        </Text>
                    </View>,
                    2
                )}

                {/* Safety Tips */}
                {renderSection(
                    '🛡️ ' + (t('safetyTips') || 'Safety Tips'),
                    'shield-outline',
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard }]}>
                        {(isRTL ? SAFETY_TIPS_AR : SAFETY_TIPS_EN).map((tip, i) => (
                            <Text key={i} style={[styles.tipItem, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'medium') }, isRTL && { textAlign: 'right' }]}>
                                {tip}
                            </Text>
                        ))}
                    </View>,
                    3
                )}

                {/* Museum Hours & Prices */}
                {renderSection(
                    t('museumHoursPrices'),
                    'time-outline',
                    <View style={{ gap: 12 }}>
                        {MUSEUM_HOURS.map((m, i) => (
                            <View key={i} style={[styles.museumCard, { backgroundColor: C.bgCard }]}>
                                <Text style={[styles.museumName, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}>
                                    {isRTL ? m.nameAr : m.nameEn}
                                </Text>
                                <View style={[styles.museumRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <View style={[styles.museumTag, { backgroundColor: C.primary + '20' }]}>
                                        <Ionicons name="time" size={12} color={C.primary} />
                                        <Text style={[styles.museumTagText, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{m.hours}</Text>
                                    </View>
                                    <Text style={[styles.museumPrice, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }]}>{isRTL ? m.priceAr : m.priceEn}</Text>
                                </View>
                            </View>
                        ))}
                    </View>,
                    4
                )}

                {/* Embassies */}
                {renderSection(
                    t('embassiesTitle'),
                    'business-outline',
                    <View style={{ gap: 12 }}>
                        {EMBASSIES.map((e, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.embassyCard, { backgroundColor: C.bgCard }]}
                                onPress={() => callNumber(e.phone)}
                            >
                                <Text style={[styles.embassyCountry, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{e.country}</Text>
                                <Text style={[styles.embassyPhone, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{e.phone}</Text>
                                <Text style={[styles.embassyAddress, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }]}>{e.address}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>,
                    5
                )}

                {/* Public Holidays */}
                {renderSection(
                    t('publicHolidaysTitle'),
                    'calendar-outline',
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard }]}>
                        {HOLIDAYS.map((h, i) => (
                            <View key={i} style={[styles.holidayRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={[styles.holidayDate, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{h.dateEn}</Text>
                                <Text style={[styles.holidayName, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'medium') }]}>{isRTL ? h.nameAr : h.nameEn}</Text>
                            </View>
                        ))}
                    </View>,
                    6
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
    },
    backBtn: { padding: 4 },
    title: { fontSize: 28, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    section: { marginBottom: 30 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: '900' },
    emergencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    emergencyCard: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emergencyIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emergencyName: { fontSize: 14, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    emergencyNumber: { fontSize: 20, fontWeight: '900' },
    infoCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoText: { fontSize: 14, fontWeight: '500', lineHeight: 24 },
    tipItem: { fontSize: 14, fontWeight: '500', lineHeight: 24, marginBottom: 12 },
    museumCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    museumName: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
    museumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    museumTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    museumTagText: { fontSize: 13, fontWeight: '700' },
    museumPrice: { fontSize: 13, fontWeight: '600' },
    embassyCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    embassyCountry: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    embassyPhone: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    embassyAddress: { fontSize: 13, fontWeight: '500' },
    holidayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    holidayDate: { fontSize: 14, fontWeight: '800', minWidth: 80 },
    holidayName: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
});
