import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/shared/constants/Colors'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'
import { Feather } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { Text } from 'react-native'

export const unstable_settings = {
	initialRouteName: 'Monitoring',
}

const getLabelOptions = (iconName: TypeFeatherIconNames) => {
	return {
		tabBarLabel: ({ focused, color, children }: any) => (
			<Text
				style={{
					color: focused ? Colors.primary : color,
					fontSize: 12
				}}
			>
				{children}
			</Text>
		),
		tabBarIcon: ({ color, focused }: any) => (
			<Feather
				size={20}
				name={iconName}
				color={focused ? Colors.primary : color}
			/>
		)
	}
}

export default function AppLayout() {
	const { user } = useAuth()

	if (!user) {
		return <Redirect href='/auth' /> 
	}

	return (
		<Tabs
			safeAreaInsets={{
				bottom: 20,
			}}
			screenOptions={{
				headerShown: false,
				headerTitle: '',
				tabBarStyle: {
					backgroundColor: Colors.black
				},
				sceneStyle: {
					backgroundColor: Colors.black
				}
			}}
		>
			<Tabs.Screen
				name='monitoring'
				options={{
					title: 'Мониторинг',
					tabBarLabelStyle: {
						color: Colors.primary
					},
					...getLabelOptions('monitor')
				}}
			/>
			<Tabs.Screen
				name='documents'
				options={{
					title: 'Документы',
					...getLabelOptions('inbox')
				}}
			/>
			<Tabs.Screen
				name='products'
				options={{
					title: 'Товары',
					...getLabelOptions('shopping-cart')
				}}
			/>
			<Tabs.Screen
				name='agents'
				options={{
					title: 'Клиенты',
					...getLabelOptions('user')
				}}
			/>
		</Tabs>
	)
}
