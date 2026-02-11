import { IUser } from '@/shared/types/user.types'
import * as SplashScreen from 'expo-splash-screen'
import {
	createContext,
	Dispatch,
	FC,
	PropsWithChildren,
	SetStateAction,
	useEffect,
	useState
} from 'react'

type TypeUserState = IUser | null

interface IContext {
	user: TypeUserState
	setUser: Dispatch<SetStateAction<TypeUserState>>
}

let ignore = SplashScreen.preventAutoHideAsync()

export const AuthContext = createContext({} as IContext)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<TypeUserState>({})

	useEffect(() => {
		let mounted = true

		const checkAccessToken = async () => {
			try {
			} catch (error) {
			} finally {
				await SplashScreen.hideAsync()
			}
		}

		let ignore = checkAccessToken()

		return () => {
			mounted = false
		}
	}, [])

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	)
}
