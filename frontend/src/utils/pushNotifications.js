import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  
  try {
    const currentToken = await getToken(messaging, { 
        // VAPID key is required for web push. Generate this in Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
        vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' 
    });
    
    if (currentToken) {
      console.log('Got FCM token:', currentToken);
      // You can send this token to your backend to send push notifications to this device.
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
