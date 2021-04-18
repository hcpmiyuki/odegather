import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
import firebase from 'firebase'

Vue.use(firestorePlugin)

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: 'AIzaSyB4q37cqEFVY20hbpe_ryjrNWaD3ygA2w0',
  authDomain: 'portfolio-310607.firebaseapp.com',
  projectId: 'portfolio-310607',
  storageBucket: 'portfolio-310607.appspot.com',
  messagingSenderId: '958046740531',
  appId: '1:958046740531:web:4409634615d79708ef0346',
  measurementId: 'G-CDVM19X31C'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export const db = firebase.firestore()
