import firebase from "firebase/compat/app"
import "firebase/compat/auth"

const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "application-5c3f8"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const auth = firebase.auth()

if (__DEV__) {
  auth.useEmulator("http://10.15.137.55:9099") // your WIFI IP
}

export {auth}