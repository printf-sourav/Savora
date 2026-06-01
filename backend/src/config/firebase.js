import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isFirebaseConfigured = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseConfigured = true;
    console.log("Firebase Admin Initialized successfully.");
  } else {
    console.warn("Firebase Admin not configured. Provide FIREBASE_SERVICE_ACCOUNT_KEY_PATH in .env (e.g. FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-admin.json)");
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error.message);
}

export { admin, isFirebaseConfigured };
