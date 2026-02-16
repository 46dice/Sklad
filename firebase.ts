// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import {
	createUserWithEmailAndPassword,
	initializeAuth,
	signInWithEmailAndPassword,
	getReactNativePersistence
} from 'firebase/auth'
import { collection, getDocs, getFirestore } from 'firebase/firestore/lite'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAD50d-b9Eznr03du6fDya6mO98Cweh_Ho',
	authDomain: 'sklad-f1de4.firebaseapp.com',
	databaseURL: 'https://sklad-f1de4-default-rtdb.firebaseio.com',
	projectId: 'sklad-f1de4',
	storageBucket: 'sklad-f1de4.firebasestorage.app',
	messagingSenderId: '840792690821',
	appId: '1:840792690821:web:1eb2a2010630b0fd0099ec',
	measurementId: 'G-CE267FYMZN'
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
