import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Request notification permissions
 */
export async function requestPermissions() {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        // Android channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Egypt Tourism',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
            });
        }

        return true;
    } catch (e) {
        console.log('Notification permission error:', e);
        return false;
    }
}

/**
 * Schedule a daily morning trip reminder
 * @param {string} tripName - Name of the trip
 * @param {string} firstActivity - First activity description
 * @param {boolean} isRTL - Is Arabic
 */
export async function scheduleMorningReminder(tripName, firstActivity, isRTL) {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();

        const title = isRTL ? '🌅 صباح الخير! خطتك اليوم' : '🌅 Good Morning! Your plan today';
        const body = isRTL
            ? `${tripName}: ${firstActivity}`
            : `${tripName}: ${firstActivity}`;

        await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: {
                type: 'daily',
                hour: 8,
                minute: 0,
            },
        });

        return true;
    } catch (e) {
        console.log('Schedule notification error:', e);
        return false;
    }
}

/**
 * Send an instant local notification
 */
export async function sendInstantNotification(title, body) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: null, // instant
        });
    } catch (e) {
        console.log('Instant notification error:', e);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
        console.log('Cancel notification error:', e);
    }
}
