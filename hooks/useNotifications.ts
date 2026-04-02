// hooks/useNotifications.ts

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Schedule a daily reminder at 8:00 PM
      await scheduleDailyReminder();
    };

    setupNotifications();
  }, []);

  const scheduleDailyReminder = async () => {
    // Clear any existing triggers to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "How did you spend today? 💰",
        body: "Take 30 seconds to log your daily transactions and keep your streak alive!",
        sound: true,
      },
      trigger: {
        hour: 20, // 8 PM
        minute: 0,
        repeats: true,
      },
    });
  };
};