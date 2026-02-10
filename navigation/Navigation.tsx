import {
	NavigationContainer,
	NavigationIndependentTree
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TypeRootStackParamList } from './navigation.types'
import { userRoutes } from './user.routes'

const Stack = createNativeStackNavigator<TypeRootStackParamList>()

export function Navigation() {
	return (
		<NavigationIndependentTree>
			<NavigationContainer>
				<Stack.Navigator>
					{userRoutes.map(route => (
						<Stack.Screen
							key={route.name}
							name={route.name}
							component={route.component}
						/>
					))}
				</Stack.Navigator>
			</NavigationContainer>
		</NavigationIndependentTree>
	)
}
