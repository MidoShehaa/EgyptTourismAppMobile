import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useReviews } from '../hooks/useReviews';
import { useSettings } from '../store/SettingsContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function ReviewSection({ placeId }) {
    const { user } = useAuth();
    const { reviews, addReview } = useReviews(placeId);
    const { t, settings, showToast } = useSettings();
    const navigation = useNavigation();

    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [isReviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const handleSubmitReview = async () => {
        if (!user) {
            showToast('You must be logged in to leave a review.', 'error', 'alert-circle');
            return;
        }
        if (!reviewComment.trim()) {
            showToast('Please enter a comment.', 'error', 'alert-circle');
            return;
        }
        try {
            await addReview(reviewRating, reviewComment);
            setReviewModalVisible(false);
            setReviewComment('');
            setReviewRating(5);
            showToast('Review submitted!', 'success', 'checkmark-circle');
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
        }
    };

    return (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }, { justifyContent: 'space-between' }]}>
                <Text style={[styles.sectionTitle, { color: C.textMain }]}>{t('reviews') || 'Reviews'}</Text>
                <TouchableOpacity onPress={() => {
                    if (!user) {
                        showToast('Please login first', 'error');
                        navigation.navigate('Profile');
                    } else {
                        setReviewModalVisible(true);
                    }
                }}>
                    <Text style={{ color: C.primary, fontWeight: '700' }}>{t('addReview') || 'Add Review'}</Text>
                </TouchableOpacity>
            </View>
            
            {reviews.length === 0 ? (
                <Text style={{ color: C.textMuted, textAlign: isRTL ? 'right' : 'left' }}>No reviews yet. Be the first!</Text>
            ) : (
                <View style={styles.reviewsList}>
                    {reviews.map((rev) => (
                        <View key={rev.id} style={[styles.reviewItem, { backgroundColor: C.bgElevated }]}>
                            <View style={[styles.reviewTop, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={[styles.reviewAuthor, { color: C.primary }]}>{rev.userEmail?.split('@')[0] || 'User'}</Text>
                                <View style={styles.ratingStars}>
                                    {[...Array(5)].map((_, i) => (
                                        <Ionicons key={i} name={i < rev.rating ? "star" : "star-outline"} size={14} color="#FFD700" />
                                    ))}
                                </View>
                            </View>
                            <Text style={[styles.reviewText, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{rev.comment}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Add Review Modal */}
            <Modal visible={isReviewModalVisible} animationType="fade" transparent={true} onRequestClose={() => setReviewModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: 'rgba(18, 18, 18, 0.95)' }]}>
                        <Text style={[styles.modalTitle, isRTL && { textAlign: 'right' }, { color: C.textMain }]}>{t('writeReview') || 'Write a Review'}</Text>
                        
                        {/* Star Selection */}
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'center', marginBottom: 20 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setReviewRating(star)} style={{ padding: 5 }}>
                                    <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={32} color="#FFD700" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.modalInput, isRTL && { textAlign: 'right' }, { backgroundColor: 'rgba(0,0,0,0.5)', color: C.textMain, height: 100, textAlignVertical: 'top', paddingTop: 16 }]}
                            placeholder={t('commentPlaceholder') || 'Tell us about your experience...'}
                            placeholderTextColor={C.textMuted}
                            multiline
                            value={reviewComment}
                            onChangeText={setReviewComment}
                        />
                        <View style={[styles.modalActions, isRTL && { flexDirection: 'row-reverse' }]}>
                            <TouchableOpacity style={[styles.modalBtn, { borderColor: '#000' }]} onPress={() => setReviewModalVisible(false)}>
                                <Text style={[styles.modalBtnText, { color: C.textMuted }]}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: C.primary, borderColor: '#fff' }]} onPress={handleSubmitReview}>
                                <Text style={[styles.modalBtnText, { color: '#000' }]}>{t('submit') || 'Submit'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    reviewsList: {
        gap: 12,
    },
    reviewItem: {
        padding: 16,
        borderRadius: 16,
    },
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingStars: {
        flexDirection: 'row',
    },
    reviewAuthor: {
        fontSize: 12,
        fontWeight: '900',
    },
    reviewText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 20,
    },
    modalInput: {
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: 14,
        fontWeight: '900',
    },
});
