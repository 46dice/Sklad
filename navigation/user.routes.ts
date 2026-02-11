import { Agents } from '@/components/Screens/agents/Agents'
import { Auth } from '@/components/Screens/auth/Auth'
import { Documents } from '@/components/Screens/documents/Documents'
import { Monitoring } from '@/components/Screens/monitoring/Monitoring'
import { Products } from '@/components/Screens/products/Products'
import { IRoute } from './navigation.types'

export const userRoutes: IRoute[] = [
	{
		name: 'Monitoring',
		component: Monitoring,
		isAdmin: false
	},
	{
		name: 'Documents',
		component: Documents,
		isAdmin: false
	},
	{
		name: 'Products',
		component: Products,
		isAdmin: false
	},
	{
		name: 'Agents',
		component: Agents,
		isAdmin: false
	},
	{
		name: 'Auth',
		component: Auth,
		isAdmin: false
	}
]
