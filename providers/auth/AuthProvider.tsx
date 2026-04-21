import { auth, db, onLogin, onRegister } from '@/firebase'
import { IUserProfile, UserRole } from '@/shared/types/user.types'
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
	handleRegister: (email: string, password: string, role: UserRole) => Promise<any>
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

	const handleRegister = async (email: string, password: string, role: UserRole = 'manager') => {
		try {
			setIsLoading(true)
			const userCredential = await onRegister(email, password)
			const { user } = userCredential

			// Формируем права доступа в зависимости от роли
			const permissionsArray: string[] = []
			
			if (role === 'manager') {
				// Права менеджера
				permissionsArray.push(
					'products:read', 'products:write',
					'sales:read', 'sales:write',
					'clients:read', 'clients:write',
					'contracts:read', 'contracts:write',
					'deliveries:read', 'deliveries:write', 'deliveries:assign', 'deliveries:report',
					'reports:read', 'reports:export',
					'users:read'
				)
			} else if (role === 'courier') {
				// Права курьера
				permissionsArray.push(
					'products:read',
					'deliveries:read', 'deliveries:report'
				)
			}

			const newUserProfile: IUserProfile = {
				email: user.email || '',
				role,
				permissions: permissionsArray,
				isActive: true,
				createdAt: new Date()
			}

			await setDoc(doc(db, 'users', user.uid), newUserProfile)

			return userCredential
		} catch (error: any) {
			console.error('Registration error:', error)
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
