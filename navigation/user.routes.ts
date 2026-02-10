import { Home } from '@/components/Screens/home/Home'
import { IRoute } from './navigation.types'
import { Auth } from '@/components/Screens/auth/Auth'

export const userRoutes: IRoute[] = [
	{
		name: 'Home',
		component: Home,
		isAdmin: false
	},
	{
		name: 'Auth',
		component: Auth,
		isAdmin: false
	}
]
