// Firebase Configuration for Restaurant App
const firebaseConfig = {
    apiKey: "AIzaSyYourApiKeyHere",
    authDomain: "restaurant-app.firebaseapp.com",
    projectId: "restaurant-app",
    storageBucket: "restaurant-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Make available globally
window.firebaseAuth = auth;
window.firebaseDB = db;
