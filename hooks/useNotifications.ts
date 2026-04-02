// hooks/useNotifications.ts

import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4F46E5",
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
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
        // Expo requires an explicit trigger type for scheduled reminders.
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20, // 8 PM
        minute: 0,
      },
    });
  };

  return {
    scheduleDailyReminder,
    sendGoalSetupNotification,
    scheduleDailyGoalReminder,
  };
};

// --- Helper functions for triggering notifications ---

export const sendGoalSetupNotification = async (title: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Goal Created! 🎯",
      body: `You've set a new goal: "${title}". We'll help you stay on track!`,
      sound: true,
    },
    trigger: null, // immediate
  });
};

export const scheduleDailyGoalReminder = async (goalId: string, title: string, hour: number, minute: number) => {
  // We use the goalId as part of the identifier to avoid overlapping with other goals
  await Notifications.scheduleNotificationAsync({
    identifier: `goal-reminder-${goalId}`,
    content: {
      title: `Don't forget your goal: ${title} 🏆`,
      body: "Have you made any progress today? Log your savings now!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};
