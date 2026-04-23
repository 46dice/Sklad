import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/shared/constants/Colors'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'
import { Feather } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'

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
	const { user, userProfile, isLoading } = useAuth()

	if (!user) {
		return <Redirect href='/auth' /> 
	}

	// Показываем загрузку пока профиль не загружен
	if (isLoading || !userProfile) {
		return (
			<View className='flex-1 items-center justify-center' style={{ backgroundColor: Colors.black }}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		)
	}

	const isCourier = userProfile.role === 'courier'

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
					...getLabelOptions('monitor'),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='documents'
				options={{
					title: 'Документы',
					...getLabelOptions('inbox'),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='products'
				options={{
					title: 'Услуги',
					...getLabelOptions('shopping-cart'),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='income'
				options={{
					title: 'Доход',
					...getLabelOptions('dollar-sign'),
					href: !isCourier ? null : undefined,
					sceneStyle: {
						backgroundColor: Colors.black
					}
				}}
			/>
			<Tabs.Screen
				name='deliveries'
				options={{
					title: 'Доставки',
					...getLabelOptions('truck')
				}}
			/>
			<Tabs.Screen
				name='agents'
				options={{
					title: 'Клиенты',
					...getLabelOptions('user'),
					href: isCourier ? null : undefined
				}}
			/>
		</Tabs>
	)
}
