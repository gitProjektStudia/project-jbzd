import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyAI0lP_5grM9XRqgOibKTlJ_0HfLz5Chqk",
    authDomain: "project-jbzd.firebaseapp.com",
    projectId: "project-jbzd",
    storageBucket: "project-jbzd.appspot.com",
    messagingSenderId: "203790107071",
    appId: "1:203790107071:web:cd9bd3fe71a7c92943e10a",
    measurementId: "G-9TCYF3RJW5",
    databaseURL: "https://project-jbzd-default-rtdb.europe-west1.firebasedatabase.app"
};

const firebase = initializeApp(firebaseConfig)
export const auth = getAuth()
export const database = getDatabase(firebase)
export default firebase