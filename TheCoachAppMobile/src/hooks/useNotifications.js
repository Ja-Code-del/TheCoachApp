import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure le handler global — à appeler une fois au démarrage de l'app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Demande la permission — retourne true si accordée
export async function requestNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Calcule le nombre de jours restants entre maintenant et la date cible
function daysUntil(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

// Construit le message de la notif
function buildMessage(reminder, eventName, targetDate) {
  if (reminder.message?.trim()) return reminder.message.trim();
  const name = eventName?.trim() || 'Ton événement';
  const days = daysUntil(targetDate);
  if (days <= 0) return `${name} — C'est aujourd'hui ! 🎉`;
  if (days === 1) return `${name} — C'est demain ! ✨`;
  return `${name} approche ! Plus que ${days} jour${days > 1 ? 's' : ''}.`;
}

// Annule toutes les notifs associées à un event (identifiées par leur identifier préfixé)
export async function cancelEventNotifications(eventId) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled
    .filter(n => n.identifier.startsWith(`reminder_${eventId}_`))
    .map(n => n.identifier);
  await Promise.all(toCancel.map(id => Notifications.cancelScheduledNotificationAsync(id)));
}

// Schedule les rappels d'un event — annule d'abord les anciens
export async function scheduleEventReminders(event) {
  const reminders = event.reminders || [];
  if (reminders.length === 0) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Annule les notifs existantes pour cet event
  await cancelEventNotifications(event.id);

  const now = new Date();

  for (const reminder of reminders) {
    if (!reminder.datetime) continue;
    const triggerDate = new Date(reminder.datetime);
    if (triggerDate <= now) continue; // passé → ignore

    const message = buildMessage(reminder, event.eventName || event.theme, event.targetDate);

    await Notifications.scheduleNotificationAsync({
      identifier: `reminder_${event.id}_${reminder.id}`,
      content: {
        title: event.eventName || event.theme || 'Rappel',
        body: message,
        sound: true,
      },
      trigger: {
        type: 'date',
        date: triggerDate,
      },
    });
  }
}

// Hook à appeler dans App.jsx — reschedule quand les events changent
export function useNotifications(events) {
  useEffect(() => {
    if (!events || events.length === 0) return;
    events.forEach(event => {
      if (event.reminders?.length > 0) {
        scheduleEventReminders(event);
      }
    });
  }, [events]);
}