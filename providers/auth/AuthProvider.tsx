import { auth, db, onLogin, onRegister } from '@/firebase'
import { Auth, User } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore/lite'
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
	isLoading: boolean
	handleRegister: (a: string, b: string) => Promise<any>
	handleLogin: (a: string, b: string) => Promise<any>
	authFirebase: Auth
}

export const AuthContext = createContext({} as IContext)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
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

			await setDoc(doc(db, 'users', user.uid), { newUser })

			return userCredential
		} catch (error: any) {
			throw new Error(error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		setIsLoading(true)
		const unsubscribe = authFirebase.onAuthStateChanged(firebaseUser => {
			if (firebaseUser) {
				setUser(firebaseUser)
			} else {
				setUser(null)
			}
			setIsLoading(false)
		})

		return () => unsubscribe()
	}, [authFirebase])
	const value = useMemo(
		() => ({
			user,
			setUser,
			isLoading,
			handleLogin,
			handleRegister,
			authFirebase
		}),
		[authFirebase, isLoading, user]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
