import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'
import { Feather } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'

export const unstable_settings = {
	initialRouteName: 'Monitoring',
}

const getLabelOptions = (iconName: TypeFeatherIconNames, primaryColor: string, inactiveColor: string) => {
	return {
		tabBarLabel: ({ focused, color, children }: any) => (
			<Text
				style={{
					color: focused ? primaryColor : inactiveColor,
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
				color={focused ? primaryColor : inactiveColor}
			/>
		)
	}
}

export default function AppLayout() {
	const { user, userProfile, isLoading } = useAuth()
	const { colors } = useTheme()

	if (!user) {
		return <Redirect href='/auth' /> 
	}

	// Показываем загрузку пока профиль не загружен
	if (isLoading || !userProfile) {
		return (
			<View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
				<ActivityIndicator size='large' color={colors.primary} />
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
					backgroundColor: colors.surface,
					borderTopColor: colors.border
				},
				sceneStyle: {
					backgroundColor: colors.background
				}
			}}
		>
			<Tabs.Screen
				name='monitoring'
				options={{
					title: 'Мониторинг',
					...getLabelOptions('monitor', colors.primary, colors.textSecondary),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='documents'
				options={{
					title: 'Документы',
					...getLabelOptions('inbox', colors.primary, colors.textSecondary),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='products'
				options={{
					title: 'Услуги',
					...getLabelOptions('shopping-cart', colors.primary, colors.textSecondary),
					href: isCourier ? null : undefined
				}}
			/>
			<Tabs.Screen
				name='income'
				options={{
					title: 'Доход',
					...getLabelOptions('dollar-sign', colors.primary, colors.textSecondary),
					href: !isCourier ? null : undefined,
					sceneStyle: {
						backgroundColor: colors.background
					}
				}}
			/>
			<Tabs.Screen
				name='deliveries'
				options={{
					title: 'Доставки',
					...getLabelOptions('truck', colors.primary, colors.textSecondary)
				}}
			/>
			<Tabs.Screen
				name='agents'
				options={{
					title: 'Клиенты',
					...getLabelOptions('user', colors.primary, colors.textSecondary),
					href: isCourier ? null : undefined
				}}
			/>
		</Tabs>
	)
}
