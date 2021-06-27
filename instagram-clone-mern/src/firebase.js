import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCZVHagHhJk2jqAyaQz0h7VKP9tbfxShNM",
    authDomain: "instagram-clone-4c86f.firebaseapp.com",
    projectId: "instagram-clone-4c86f",
    storageBucket: "instagram-clone-4c86f.appspot.com",
    messagingSenderId: "94341084098",
    appId: "1:94341084098:web:8c8b615ca3baac7d1fdc5b"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };