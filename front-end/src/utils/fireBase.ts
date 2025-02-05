// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCW_XKJj_LI106mdskNOCvk3EReSsZEpW0",
  authDomain: "dz-estate-bd932.firebaseapp.com",
  projectId: "dz-estate-bd932",
  storageBucket: "dz-estate-bd932.firebasestorage.app",
  messagingSenderId: "457851364158",
  appId: "1:457851364158:web:7d1262073d2703bb7e426f",
  measurementId: "G-89KX5PZ388"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export {app}