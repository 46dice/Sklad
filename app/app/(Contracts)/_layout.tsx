import { useTheme } from '@/providers/theme/ThemeProvider'
import { Stack, useRouter } from 'expo-router'
import { Platform, Text } from 'react-native'

const ContractsLayout = () => {
	const router = useRouter()
	const { colors } = useTheme()

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text },
				headerTintColor: colors.text,
				contentStyle: { backgroundColor: colors.background }
			}}
		>
			<Stack.Screen
				name='new'
				options={{
					title: 'Новый акт',
					headerRight: () => (
						<Text
							style={{ color: Platform.select({ ios: '#007AFF', android: '#2196F3' }), fontSize: 17, fontWeight: '600' }}
							onPress={() => router.back()}
						>
							Закрыть
						</Text>
					)
				}}
			/>
			<Stack.Screen
				name='edit/[id]'
				options={{
					title: 'Редактировать акт',
					headerRight: () => (
						<Text
							style={{ color: Platform.select({ ios: '#007AFF', android: '#2196F3' }), fontSize: 17, fontWeight: '600' }}
							onPress={() => router.back()}
						>
							Закрыть
						</Text>
					)
				}}
			/>
			<Stack.Screen
				name='view/[id]'
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='invoice'
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='invoice-view/[id]'
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false
				}}
			/>
		</Stack>
	)
}

export default ContractsLayout
