import { Screen404 } from '@/components/Screens/System/Screen404'
import { Auth } from '@/components/Screens/auth/Auth'
import { BottomMenuNav } from '@/components/Screens/layout/BottomMenuNav'
import { useAuth } from '@/providers/auth/useAuth'
import {
	NavigationContainer,
	NavigationIndependentTree
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useNavigationContainerRef } from 'expo-router'
import { useEffect, useState } from 'react'
import { TypeRootStackParamList } from './navigation.types'
import { userRoutes } from './user.routes'

const Stack = createNativeStackNavigator<TypeRootStackParamList>()

export function Navigation() {
	const { user } = useAuth()
	const [currentRoute, setCurrentRoute] = useState<string | undefined>(
		undefined
	)
	const navRef = useNavigationContainerRef()

	useEffect(() => {
		setCurrentRoute(navRef.getCurrentRoute()?.name)

		const listenerNavigation = navRef.addListener('state', () =>
			setCurrentRoute(navRef.getCurrentRoute()?.name)
		)
		console.log(currentRoute)
		return () => {
			navRef.removeListener('state', listenerNavigation)
		}
	}, [navRef])

	return (
		<NavigationIndependentTree>
			<NavigationContainer ref={navRef}>
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
						contentStyle: {
							backgroundColor: '#090909'
						}
					}}
				>
					{user ? (
						userRoutes.map(route =>
							user.isAdmin || !route.isAdmin ? (
								<Stack.Screen
									key={route.name}
									name={route.name}
									component={route.component}
								/>
							) : (
								<Stack.Screen
									key='Screen404'
									name='Screen404'
									component={Screen404}
								/>
							)
						)
					) : (
						<Stack.Screen key='Auth' name='Auth' component={Auth} />
					)}
				</Stack.Navigator>
			</NavigationContainer>
			{user && currentRoute && (
				<BottomMenuNav nav={navRef.navigate} currentRoute={currentRoute} />
			)}
		</NavigationIndependentTree>
	)
}
