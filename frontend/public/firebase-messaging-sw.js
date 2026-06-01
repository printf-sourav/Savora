importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Config will be injected from URL params or we can use default setup for receiving. 
// However, the cleanest way is to just define it here. Since this is just for receiving background notifications.
// It's recommended to build the SW if using V9 or use the compat version.
// For the purpose of the assignment, the user wants push+pwa. 
// We will set up a boilerplate SW.

firebase.initializeApp({
  // You would typically replace these with actual values if building via a script, 
  // or pass them in a production build, but Firebase allows empty config for basic background receiving 
  // in some setups, OR we must provide the messagingSenderId.
  messagingSenderId: "123456789" // Placeholder if env not built into this file. 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
