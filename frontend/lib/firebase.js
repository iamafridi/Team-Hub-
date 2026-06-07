import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCP4fv3AP2DjdV8RX2_Mlix1sHSWTBR72o",
  authDomain: "team-hub-507be.firebaseapp.com",
  projectId: "team-hub-507be",
  storageBucket: "team-hub-507be.firebasestorage.app",
  messagingSenderId: "136641843172",
  appId: "1:136641843172:web:2d0ec252f61bf1a821c1f1",
  measurementId: "G-F439KLCT9S"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
