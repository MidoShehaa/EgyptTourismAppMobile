import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import DynamicBackground from '../components/DynamicBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Knowledge base for rule-based responses
const KNOWLEDGE = {
    bestTime: {
        keywords: ['best time', 'when to visit', 'أحسن وقت', 'متى', 'امتى'],
        en: '🌡️ **Best Time to Visit Egypt:**\n\n• **October - April** is ideal (cooler weather)\n• **Upper Egypt (Luxor/Aswan):** Nov-Feb is perfect (30-35°C day)\n• **Red Sea (Hurghada/Sharm):** Year-round, water is warm\n• **Cairo:** Oct-Apr to avoid summer heat (40°C+)\n• **Siwa Oasis:** Mar-May or Sep-Nov\n\n⚠️ Avoid Jul-Aug for Upper Egypt — temperatures can exceed 45°C!',
        ar: '🌡️ **أفضل وقت لزيارة مصر:**\n\n• **أكتوبر - أبريل** هو الوقت المثالي\n• **صعيد مصر (الأقصر/أسوان):** نوفمبر-فبراير (30-35°)\n• **البحر الأحمر (الغردقة/شرم):** طوال السنة\n• **القاهرة:** أكتوبر-أبريل لتجنب الحر\n• **واحة سيوة:** مارس-مايو أو سبتمبر-نوفمبر\n\n⚠️ تجنب يوليو-أغسطس في الصعيد — الحرارة تتجاوز 45°!',
    },
    cairo3days: {
        keywords: ['3 days cairo', 'three days cairo', '3 أيام القاهرة', '3 ايام القاهره', 'cairo itinerary', 'خطة القاهرة'],
        en: '📅 **3-Day Cairo Itinerary:**\n\n**Day 1 — Ancient Wonders:**\n🔺 Pyramids of Giza & Sphinx (morning)\n🏛️ Grand Egyptian Museum (afternoon)\n🌅 Sound & Light Show (evening)\n\n**Day 2 — Islamic Cairo:**\n🕌 Citadel of Saladin & Mohammed Ali Mosque\n🛍️ Khan El-Khalili Bazaar\n🍽️ Lunch at Naguib Mahfouz Cafe\n🌙 Nile dinner cruise (evening)\n\n**Day 3 — Modern Cairo:**\n🏛️ Egyptian Museum (Tahrir)\n⛪ Coptic Cairo (Hanging Church)\n🌳 Al-Azhar Park\n🎵 Cairo Opera House (evening)',
        ar: '📅 **خطة 3 أيام في القاهرة:**\n\n**اليوم 1 — العجائب القديمة:**\n🔺 أهرامات الجيزة وأبو الهول (صباحاً)\n🏛️ المتحف المصري الكبير (ظهراً)\n🌅 عرض الصوت والضوء (مساءً)\n\n**اليوم 2 — القاهرة الإسلامية:**\n🕌 قلعة صلاح الدين ومسجد محمد علي\n🛍️ سوق خان الخليلي\n🍽️ غداء في كافيه نجيب محفوظ\n🌙 عشاء كروز نيلي (مساءً)\n\n**اليوم 3 — القاهرة الحديثة:**\n🏛️ المتحف المصري (التحرير)\n⛪ القاهرة القبطية (الكنيسة المعلقة)\n🌳 حديقة الأزهر\n🎵 دار الأوبرا (مساءً)',
    },
    luxor: {
        keywords: ['luxor', 'الاقصر', 'الأقصر', 'karnak', 'الكرنك', 'valley of kings', 'وادي الملوك'],
        en: '🏛️ **Luxor — World\'s Greatest Open-Air Museum:**\n\n**Must-See:**\n• Karnak Temple (allow 3 hours)\n• Luxor Temple (stunning at night)\n• Valley of the Kings (3 tombs included)\n• Hatshepsut Temple\n• Colossi of Memnon\n\n**Tips:**\n• Start early (6 AM) to beat the heat\n• West Bank = tombs, East Bank = temples\n• Hot air balloon at sunrise is magical 🎈\n• Budget: ~1,500 EGP for all tickets\n• Best time: November - February',
        ar: '🏛️ **الأقصر — أكبر متحف مفتوح في العالم:**\n\n**لازم تزور:**\n• معبد الكرنك (3 ساعات)\n• معبد الأقصر (مذهل بالليل)\n• وادي الملوك (3 مقابر)\n• معبد حتشبسوت\n• تمثالا ممنون\n\n**نصائح:**\n• ابدأ بدري (6 الصبح) عشان الحر\n• الضفة الغربية = المقابر، الشرقية = المعابد\n• رحلة البالون وقت الشروق لا تُنسى 🎈\n• الميزانية: ~1,500 جنيه لكل التذاكر\n• أفضل وقت: نوفمبر - فبراير',
    },
    food: {
        keywords: ['food', 'eat', 'restaurant', 'أكل', 'مطعم', 'اكل', 'كشري', 'koshari', 'ملوخية'],
        en: '🍽️ **Must-Try Egyptian Food:**\n\n🥘 **Koshari** — Egypt\'s national dish (rice, lentils, pasta, tomato sauce)\n🥙 **Foul & Taameya** — Egyptian breakfast staple\n🍖 **Kebab & Kofta** — grilled perfection\n🥬 **Molokhia** — green soup, served with rice\n🍰 **Konafa & Basbousa** — sweet desserts\n🥤 **Sugarcane Juice** — refreshing street drink\n\n**Where to Eat:**\n• Street food: 20-50 EGP per meal\n• Mid-range: 150-300 EGP\n• Fine dining: 500-1000 EGP\n\n💡 Tip: Try "Zooba" or "Kazouza" for modern Egyptian street food!',
        ar: '🍽️ **لازم تجرب من الأكل المصري:**\n\n🥘 **كشري** — الطبق الوطني\n🥙 **فول وطعمية** — فطار مصري أصيل\n🍖 **كباب وكفتة** — مشويات مصرية\n🥬 **ملوخية** — شوربة خضراء مع أرز\n🍰 **كنافة وبسبوسة** — حلويات شرقية\n🥤 **عصير قصب** — مشروب الشارع المنعش\n\n**أسعار تقريبية:**\n• أكل شوارع: 20-50 جنيه\n• مطعم متوسط: 150-300 جنيه\n• مطعم فاخر: 500-1000 جنيه\n\n💡 نصيحة: جرب "زوبا" أو "كازوزة" لأكل شوارع عصري!',
    },
    diving: {
        keywords: ['diving', 'snorkeling', 'غوص', 'سنوركلينج', 'red sea', 'البحر الاحمر', 'البحر الأحمر', 'dahab', 'دهب'],
        en: '🤿 **Diving in Egypt — Red Sea Guide:**\n\n**Top Dive Sites:**\n• 🐠 Ras Mohammed (Sharm El Sheikh) — coral walls\n• 🦈 Brothers Islands — sharks & big fish\n• 🚢 SS Thistlegorm (wreck dive) — world-famous\n• 🐢 Abu Dabbab (Marsa Alam) — dugongs & turtles\n• 💎 Blue Hole (Dahab) — iconic freediving spot\n\n**Costs:**\n• Single dive: 40-60 USD\n• PADI Open Water course: 300-400 USD\n• Snorkeling trip: 20-30 USD\n\n**Best Time:** Year-round! Water temp: 22-28°C',
        ar: '🤿 **الغوص في مصر — دليل البحر الأحمر:**\n\n**أفضل مواقع الغوص:**\n• 🐠 رأس محمد (شرم الشيخ) — جدران مرجانية\n• 🦈 جزر الإخوة — أسماك قرش وأسماك كبيرة\n• 🚢 SS Thistlegorm (حطام سفينة) — عالمي\n• 🐢 أبو دباب (مرسى علم) — أطوم وسلاحف\n• 💎 البلو هول (دهب) — أيقونة الغوص الحر\n\n**التكاليف:**\n• غوصة واحدة: 40-60 دولار\n• كورس PADI: 300-400 دولار\n• سنوركلينج: 20-30 دولار\n\n**أفضل وقت:** طوال السنة! حرارة المياه: 22-28°',
    },
    budget: {
        keywords: ['budget', 'cost', 'how much', 'ميزانية', 'تكلفة', 'كام', 'بكام'],
        en: '💰 **Egypt Travel Budget Guide:**\n\n**Budget Traveler (per day):**\n• Hostel: 200-400 EGP\n• Food: 150-250 EGP\n• Transport: 100-200 EGP\n• Activities: 200-400 EGP\n• **Total: ~700-1,250 EGP ($15-25)**\n\n**Mid-Range (per day):**\n• 3-star hotel: 800-1,500 EGP\n• Food: 300-500 EGP\n• Private transport: 400-600 EGP\n• Activities: 400-600 EGP\n• **Total: ~2,000-3,200 EGP ($40-65)**\n\n**Luxury (per day):**\n• 5-star hotel: 3,000-8,000 EGP\n• Fine dining: 1,000+ EGP\n• **Total: ~5,000-12,000 EGP ($100-250)**',
        ar: '💰 **دليل ميزانية السفر في مصر:**\n\n**مسافر اقتصادي (يومياً):**\n• هوستل: 200-400 جنيه\n• أكل: 150-250 جنيه\n• مواصلات: 100-200 جنيه\n• أنشطة: 200-400 جنيه\n• **الإجمالي: ~700-1,250 جنيه**\n\n**متوسط (يومياً):**\n• فندق 3 نجوم: 800-1,500 جنيه\n• أكل: 300-500 جنيه\n• مواصلات خاصة: 400-600 جنيه\n• أنشطة: 400-600 جنيه\n• **الإجمالي: ~2,000-3,200 جنيه**\n\n**فاخر (يومياً):**\n• فندق 5 نجوم: 3,000-8,000 جنيه\n• مطاعم فاخرة: 1,000+ جنيه\n• **الإجمالي: ~5,000-12,000 جنيه**',
    },
    safety: {
        keywords: ['safe', 'safety', 'danger', 'أمان', 'آمن', 'خطر'],
        en: '🛡️ **Egypt Safety Guide:**\n\n✅ **Egypt is generally safe for tourists!**\n\n**Do\'s:**\n• Use Uber/Careem or metered taxis\n• Drink bottled water only\n• Dress modestly at religious sites\n• Keep copies of your passport\n• Negotiate prices before services\n\n**Don\'ts:**\n• Don\'t accept "free" gifts from strangers\n• Don\'t take photos of military areas\n• Don\'t change money on the street\n\n📞 **Emergency Numbers:**\n• Police: 122\n• Tourist Police: 126\n• Ambulance: 123',
        ar: '🛡️ **دليل الأمان في مصر:**\n\n✅ **مصر آمنة للسياح بشكل عام!**\n\n**افعل:**\n• استخدم أوبر/كريم أو تاكسي بعداد\n• اشرب مياه معبأة فقط\n• البس ملابس محتشمة في الأماكن الدينية\n• احتفظ بنسخة من جواز سفرك\n• تفاوض على الأسعار مسبقاً\n\n**لا تفعل:**\n• لا تقبل "هدايا" من الغرباء\n• لا تصور مناطق عسكرية\n• لا تغير فلوس في الشارع\n\n📞 **أرقام الطوارئ:**\n• الشرطة: 122\n• شرطة السياحة: 126\n• الإسعاف: 123',
    },
};

const GREETING_EN = "👋 **Welcome to Egypt Tour Guide!**\n\nI can help you with:\n• 🗓️ Itinerary suggestions\n• 🌡️ Best time to visit\n• 🍽️ Food recommendations\n• 💰 Budget planning\n• 🤿 Diving & activities\n• 🛡️ Safety tips\n\nJust ask me anything about Egypt!";

const GREETING_AR = "👋 **أهلاً بك في مرشدك السياحي!**\n\nأقدر أساعدك في:\n• 🗓️ اقتراحات خطط الرحلات\n• 🌡️ أفضل وقت للزيارة\n• 🍽️ اقتراحات أكل\n• 💰 تخطيط الميزانية\n• 🤿 الغوص والأنشطة\n• 🛡️ نصائح أمان\n\nاسألني أي حاجة عن مصر!";

const FALLBACK_EN = "🤔 I'm not sure about that. Try asking about:\n• Best time to visit Egypt\n• 3-day Cairo itinerary\n• Egyptian food & restaurants\n• Budget & costs\n• Diving spots\n• Safety tips\n\nOr use the **Search** feature to find specific places!";

const FALLBACK_AR = "🤔 مش متأكد من دا. جرب تسأل عن:\n• أفضل وقت لزيارة مصر\n• خطة 3 أيام في القاهرة\n• الأكل المصري والمطاعم\n• الميزانية والتكاليف\n• مواقع الغوص\n• نصائح الأمان\n\nأو استخدم **البحث الشامل** للبحث عن أماكن محددة!";

function findResponse(query, isRTL) {
    const q = query.toLowerCase();
    for (const [, entry] of Object.entries(KNOWLEDGE)) {
        for (const kw of entry.keywords) {
            if (q.includes(kw.toLowerCase())) {
                return isRTL ? entry.ar : entry.en;
            }
        }
    }
    return isRTL ? FALLBACK_AR : FALLBACK_EN;
}

export default function TourGuideScreen({ navigation }) {
    const { settings } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([
        { id: '0', text: isRTL ? GREETING_AR : GREETING_EN, sender: 'bot', time: new Date() }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = useCallback(() => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input.trim(), sender: 'user', time: new Date() };
        const response = findResponse(input.trim(), isRTL);
        const botMsg = { id: (Date.now() + 1).toString(), text: response, sender: 'bot', time: new Date() };

        setMessages(prev => [...prev, userMsg, botMsg]);
        setInput('');

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }, [input, isRTL]);

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : [styles.botBubble, { backgroundColor: C.bgElevated }],
                isUser ? (isRTL ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }) : (isRTL ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }),
            ]}>
                {!isUser && (
                    <View style={[styles.botAvatar, { backgroundColor: C.primary }]}>
                        <Text style={{ fontSize: 16 }}>🏛️</Text>
                    </View>
                )}
                <Text style={[styles.messageText, { color: isUser ? '#fff' : C.textMain }, isRTL && { textAlign: 'right' }]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    const QUICK_QUESTIONS = isRTL ? [
        'أحسن وقت لزيارة مصر',
        '3 أيام القاهرة',
        'أكل مصري',
        'الغوص في دهب',
        'ميزانية الرحلة',
    ] : [
        'Best time to visit',
        '3 days Cairo',
        'Egyptian food',
        'Diving in Dahab',
        'Budget planning',
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />

            <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>
                        {isRTL ? '🤖 المرشد السياحي' : '🤖 Tour Guide AI'}
                    </Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>
                        {isRTL ? 'اسألني أي حاجة عن مصر' : 'Ask me anything about Egypt'}
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListFooterComponent={() => (
                        <View style={styles.quickQuestionsWrap}>
                            {messages.length <= 1 && QUICK_QUESTIONS.map((q, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.quickChip, { backgroundColor: C.bgElevated, borderColor: C.primary + '40' }]}
                                    onPress={() => { setInput(q); }}
                                >
                                    <Text style={[styles.quickText, { color: C.primary }]}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                />

                <View style={[styles.inputRow, { backgroundColor: C.bgElevated }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TextInput
                        style={[styles.textInput, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                        placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Ask about Egypt...'}
                        placeholderTextColor={C.textMuted}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={sendMessage}
                        returnKeyType="send"
                    />
                    <TouchableOpacity style={[styles.sendBtn, { backgroundColor: C.primary }]} onPress={sendMessage}>
                        <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 16 },
    backBtn: { padding: 4 },
    title: { fontSize: 22, fontWeight: '900' },
    subtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    messagesContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
    messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20, marginBottom: 12 },
    userBubble: { backgroundColor: '#4CD8D0', borderBottomRightRadius: 4 },
    botBubble: { borderBottomLeftRadius: 4 },
    botAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    messageText: { fontSize: 15, fontWeight: '500', lineHeight: 24 },
    quickQuestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    quickChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
    quickText: { fontSize: 13, fontWeight: '700' },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 30, borderRadius: 28, paddingHorizontal: 6, paddingVertical: 6, gap: 8 },
    textInput: { flex: 1, height: 44, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
    sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
