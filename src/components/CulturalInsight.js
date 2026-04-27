import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CULTURAL_DATA } from '../constants/culturalData';
import { PHRASEBOOK_DATA } from '../constants/phrasebookData';
import { COLORS, DARK_COLORS, SPACING, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const { width, height } = Dimensions.get('window');

export default function CulturalInsight({ city }) {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const isRTL = settings?.language === 'ar';
    const C = isDark ? DARK_COLORS : COLORS;
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('culture'); // 'culture' or 'phrases'

    // City mapping (Giza -> Cairo)
    const displayCity = (city === 'Giza') ? 'Cairo' : city;
    const data = CULTURAL_DATA[displayCity] || null;

    if (!data) return null;

    return (
        <>
            <TouchableOpacity 
                style={[styles.floatingBtn, { backgroundColor: '#CC9933', borderColor: '#000' }]} 
                onPress={() => setVisible(true)}
            >
                <Ionicons name="bulb" size={24} color="#000" />
            </TouchableOpacity>

            <Modal visible={visible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard, borderColor: '#000' }]}>
                        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.title, { color: C.textMain }]}>
                                {isRTL ? `روح ${displayCity}` : `SOUL OF ${displayCity.toUpperCase()}`}
                            </Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close-circle" size={32} color={C.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Tab Switcher */}
                        <View style={[styles.tabRow, { backgroundColor: C.bgElevated, borderColor: C.primary }]}>
                            <TouchableOpacity 
                                style={[styles.tab, activeTab === 'culture' && { backgroundColor: C.primary }]}
                                onPress={() => setActiveTab('culture')}
                            >
                                <Text style={[styles.tabText, { color: activeTab === 'culture' ? '#000' : C.textMain }]}>
                                    {isRTL ? 'الثقافة' : 'CULTURE'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tab, activeTab === 'phrases' && { backgroundColor: C.primary }]}
                                onPress={() => setActiveTab('phrases')}
                            >
                                <Text style={[styles.tabText, { color: activeTab === 'phrases' ? '#000' : C.textMain }]}>
                                    {isRTL ? 'المحادثة' : 'PHRASES'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {activeTab === 'culture' ? (
                                <>
                                    {/* Slang Section */}
                                    <Text style={styles.sectionTitle}>{isRTL ? 'كلمتين للمكان' : 'LOCAL SLANG'}</Text>
                                    <View style={styles.slangGrid}>
                                        {data.slang.map((item, idx) => (
                                            <View key={idx} style={[styles.slangCard, { backgroundColor: C.bgElevated, borderColor: C.primary }]}>
                                                <Text style={[styles.term, { color: C.primary }]}>{item.term}</Text>
                                                <Text style={[styles.meaning, { color: C.textMain }]}>{item.meaning}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Traditions */}
                                    <Text style={styles.sectionTitle}>{isRTL ? 'عادات وتقاليد' : 'TRADITIONS'}</Text>
                                    {data.traditions.map((t, idx) => (
                                        <View key={idx} style={[styles.traditionRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                            <Ionicons name="checkmark-circle" size={18} color={C.primary} />
                                            <Text style={[styles.traditionText, { color: C.textMain }, isRTL && { marginRight: 10 }]}>{t}</Text>
                                        </View>
                                    ))}

                                    <View style={[styles.historyBox, { backgroundColor: '#000', borderColor: C.primary, borderWidth: 1 }]}>
                                        <Text style={[styles.historyTitle, { color: C.primary }]}>{isRTL ? 'لمحة تاريخية' : 'HISTORY'}</Text>
                                        <Text style={styles.historyText}>{data.history}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.phrasebook}>
                                    {PHRASEBOOK_DATA.map((cat, cIdx) => (
                                        <View key={cIdx} style={styles.phraseCategory}>
                                            <View style={[styles.catHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                                <Ionicons name={cat.icon} size={20} color={C.primary} />
                                                <Text style={[styles.catTitle, { color: C.textMain }]}>{cat.category}</Text>
                                            </View>
                                            {cat.phrases.map((p, pIdx) => (
                                                <View key={pIdx} style={[styles.phraseCard, { backgroundColor: C.bgElevated, borderColor: C.borderSubtle }]}>
                                                    <Text style={[styles.phraseAr, { color: C.primary }]}>{p.ar}</Text>
                                                    <Text style={[styles.phraseEn, { color: C.textMain }]}>{p.en} • {p.de} • {p.fr}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Local Tip */}
                            <View style={[styles.tipCard, { borderColor: C.primary }]}>
                                <Text style={[styles.tipTitle, { color: C.primary }]}>💡 {isRTL ? 'نصيحة للمحترفين' : 'PRO TIP'}</Text>
                                <Text style={[styles.tipText, { color: C.textMain }]}>{data.localTip}</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingBtn: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        zIndex: 1000
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        height: height * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 2,
        borderBottomWidth: 0,
        padding: 24,
    },
    tabRow: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    phrasebook: {
        marginTop: 10,
    },
    phraseCategory: {
        marginBottom: 24,
    },
    catHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    catTitle: {
        fontSize: 16,
        fontWeight: '900',
        marginLeft: 8,
        textTransform: 'uppercase',
    },
    phraseCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    phraseAr: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    phraseEn: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: FONTS.heavy,
        fontSize: 26,
        fontWeight: '900',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#CC9933',
        letterSpacing: 1,
        marginBottom: 16,
        marginTop: 20,
        textTransform: 'uppercase'
    },
    slangGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    slangCard: {
        width: '48%',
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
    },
    term: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 4,
    },
    meaning: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
    },
    traditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    traditionText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 10,
        lineHeight: 20,
    },
    historyBox: {
        marginTop: 30,
        padding: 20,
        borderRadius: 20,
    },
    historyTitle: {
        color: '#CC9933',
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 8,
    },
    historyText: {
        color: '#FFF',
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '600',
    },
    tipCard: {
        marginTop: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 50
    },
    tipTitle: {
        fontSize: 13,
        fontWeight: '900',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
        fontStyle: 'italic'
    }
});
