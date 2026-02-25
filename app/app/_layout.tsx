import { StatusBar } from 'expo-status-bar'

import { Colors } from '@/shared/constants/Colors'
import { Stack } from 'expo-router'
import {
	SafeAreaProvider,
	useSafeAreaInsets
} from 'react-native-safe-area-context'
import { Text } from 'react-native'

export default function AppLayout() {
	const { top } = useSafeAreaInsets()

	return (
		<SafeAreaProvider>
			<StatusBar style='light' />
			<Stack
				screenOptions={{
					headerShown: false,
					// statusBarStyle: 'dark',
					contentStyle: {
						backgroundColor: Colors.black,
						paddingTop: top
					}
				}}
			>
				<Stack.Screen name='(tabs)' />
				<Stack.Screen
					name='(NewClient)/modal'
					options={{
						headerTitle: 'Добавить клиента',
						presentation: 'modal',
						headerShown: true,
						headerStyle: {
							backgroundColor: Colors.black
						},
						headerTitleStyle: {
							color: Colors.white
						},
						contentStyle: {
							backgroundColor: Colors.black,
							paddingTop: 0
						}
					}}
				/>
			</Stack>
		</SafeAreaProvider>
	)
}
