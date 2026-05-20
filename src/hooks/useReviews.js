import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../store/AuthContext';

export function useReviews(placeId) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!placeId) {
            setLoading(false);
            return;
        }
        
        // Listen to reviews for this place
        const q = query(
            collection(db, 'reviews'),
            where('placeId', '==', placeId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedReviews = [];
            snapshot.forEach((doc) => {
                loadedReviews.push({ id: doc.id, ...doc.data() });
            });
            setReviews(loadedReviews);
            setLoading(false);
        }, (error) => {
            console.warn('Error fetching reviews:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [placeId]);

    const addReview = useCallback(async (rating, comment) => {
        if (!user) throw new Error('Must be logged in to leave a review.');
        
        await addDoc(collection(db, 'reviews'), {
            placeId,
            userId: user.uid,
            userEmail: user.email,
            rating,
            comment,
            createdAt: serverTimestamp()
        });
    }, [placeId, user]);

    return { reviews, loading, addReview };
}
