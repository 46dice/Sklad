// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import {
	createUserWithEmailAndPassword,
	getReactNativePersistence,
	initializeAuth,
	signInWithEmailAndPassword
} from 'firebase/auth'
import { collection, getDocs, getFirestore } from 'firebase/firestore/lite'

// Firebase configuration from environment variables
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// export const auth = getAuth(app)

export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

export const onRegister = async (email: string, password: string) => {
	try {
		const response = await createUserWithEmailAndPassword(auth, email, password)
		return response
	} catch (error: any) {
		throw new Error(error)
	}
}

export const onLogin = async (email: string, password: string) => {
	try {
		const response = await signInWithEmailAndPassword(auth, email, password)
		return response
	} catch (error: any) {
		throw new Error(error)
	}
}

export async function getCities() {
	const citiesCol = collection(db, 'users')
	const citySnapshot = await getDocs(citiesCol)
	const cityList = citySnapshot.docs.map(doc => doc.data())
	return cityList
}
