import { auth, db, onLogin, onRegister } from '@/firebase'
import { IUserProfile } from '@/shared/types/user.types'
import { Auth, User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore/lite'
import {
    createContext,
    Dispatch,
    FC,
    PropsWithChildren,
    SetStateAction,
    useEffect,
    useMemo,
    useState
} from 'react'

interface IContext {
	user: User | null
	setUser: Dispatch<SetStateAction<User | null>>
	userProfile: IUserProfile | null
	setUserProfile: Dispatch<SetStateAction<IUserProfile | null>>
	isLoading: boolean
	handleRegister: (a: string, b: string) => Promise<any>
	handleLogin: (a: string, b: string) => Promise<any>
	authFirebase: Auth
}

export const AuthContext = createContext({} as IContext)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<IUserProfile | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const authFirebase = auth

	const handleLogin = async (email: string, password: string) => {
		try {
			setIsLoading(true)
			const user = await onLogin(email, password)
			return user
		} catch (error: any) {
			console.log(error)
			throw new Error(error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleRegister = async (email: string, password: string) => {
		try {
			setIsLoading(true)
			const userCredential = await onRegister(email, password)
			const { user } = userCredential

			const newUser = {
				email: user.email,
				displayName: user.displayName,
				uid: user.uid
			}

			await setDoc(doc(db, 'users', user.uid), newUser)

			return userCredential
		} catch (error: any) {
			throw new Error(error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		setIsLoading(true)
		const unsubscribe = authFirebase.onAuthStateChanged(async firebaseUser => {
			if (firebaseUser) {
				setUser(firebaseUser)
				// Загружаем профиль пользователя
				try {
					const userDocRef = doc(db, 'users', firebaseUser.uid)
					const userDoc = await getDoc(userDocRef)
					if (userDoc.exists()) {
						setUserProfile(userDoc.data() as IUserProfile)
					} else {
						setUserProfile(null)
					}
				} catch (error) {
					console.log('Error loading user profile:', error)
					setUserProfile(null)
				}
			} else {
				setUser(null)
				setUserProfile(null)
			}
			setIsLoading(false)
		})

		return () => unsubscribe()
	}, [authFirebase])
	const value = useMemo(
		() => ({
			user,
			setUser,
			userProfile,
			setUserProfile,
			isLoading,
			handleLogin,
			handleRegister,
			authFirebase
		}),
		[authFirebase, isLoading, user, userProfile]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
