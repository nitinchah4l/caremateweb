// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized");
} else {
    console.warn("Firebase config not found. Running in Demo Mode.");
}

const auth = firebase.auth ? firebase.auth() : null;
const db = firebase.firestore ? firebase.firestore() : null;
const googleProvider = firebase.auth ? new firebase.auth.GoogleAuthProvider() : null;
