import { Colors } from '@/shared/constants/Colors'
import { Stack, useRouter } from 'expo-router'
import { Platform, Text } from 'react-native'

const ContractsLayout = () => {
	const router = useRouter()

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerStyle: {
					backgroundColor: Colors.black
				},
				headerTitleStyle: {
					color: Colors.white
				},
				headerTintColor: Colors.white,
				contentStyle: {
					backgroundColor: Colors.black
				}
			}}
		>
			<Stack.Screen
				name='new'
				options={{
					title: 'Новый договор',
					headerRight: () => (
						<Text
							style={{
								color: Platform.select({
									ios: '#007AFF',
									android: '#2196F3'
								}),
								fontSize: 17,
								fontWeight: '600'
							}}
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
					title: 'Редактировать договор'
				}}
			/>
			<Stack.Screen
				name='view/[id]'
				options={{
					headerShown: false
				}}
			/>
		</Stack>
	)
}

export default ContractsLayout
