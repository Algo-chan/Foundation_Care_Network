import * as admin from 'firebase-admin';
import prisma from '../utils/prisma';

// Initialize Firebase Admin
if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
}

/**
 * Sends a notification to a specific user
 * @param userId The ID of the user to notify
 * @param type The type of notification
 * @param message The notification message
 * @param data Optional data to include in the push notification
 */
export async function sendNotification(userId: string, type: string, message: string, data?: any) {
    try {
        // 1. Store in Database
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                message,
            },
        });

        // 2. Try to send via FCM if user has tokens
        const userDevices = await prisma.userDevice.findMany({
            where: { userId },
        });

        if (userDevices.length > 0 && admin.apps.length > 0) {
            const messages = userDevices.map(device => ({
                token: device.fcmToken,
                notification: { title: type, body: message },
                data: data || {},
            }));

            const response = await admin.messaging().sendEach(messages);
            console.log(`[FCM] Sent ${response.successCount} messages, ${response.failureCount} failed.`);
        } else {
            console.log(`[Notification] To User ${userId} (No FCM): [${type}] ${message}`);
        }

        return notification;
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}

/**
 * Broadcasts a notification to multiple users
 * @param userIds Array of user IDs
 * @param type The type of notification
 * @param message The notification message
 */
export async function broadcastNotification(userIds: string[], type: string, message: string) {
    return Promise.all(userIds.map(id => sendNotification(id, type, message)));
}
