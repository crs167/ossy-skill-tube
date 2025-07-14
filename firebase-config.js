// Firebase Configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "ossy-skill-tube.firebaseapp.com",
    projectId: "ossy-skill-tube",
    storageBucket: "ossy-skill-tube.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};

// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click the gear icon (⚙️) next to "Project Overview"
// 4. Select "Project settings"
// 5. Scroll down to "Your apps" section
// 6. Click the web app icon (</>)
// 7. Copy the config object
// 8. Replace the values above with your actual config

// Enable Google Authentication:
// 1. In Firebase Console, go to Authentication
// 2. Click "Sign-in method"
// 3. Enable "Google" provider
// 4. Add your authorized domain (localhost for development)

// Enable Firestore:
// 1. In Firebase Console, go to Firestore Database
// 2. Click "Create database"
// 3. Choose "Start in test mode" for development
// 4. Select a location close to your users

export { firebaseConfig };