/* ============================================================
   notifications.js — Browser notification scheduler
   ============================================================ */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleReminder(title, body, delayMs = 0) {
  if (Notification.permission !== 'granted') return;
  setTimeout(() => {
    new Notification(title, { body, icon: '🌿' });
  }, delayMs);
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
