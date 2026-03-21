import { StatusBar } from 'expo-status-bar'

import useClientStore from '@/components/Clients/client.model'
import useProductStore from '@/components/Products/product.model'
import { Colors } from '@/shared/constants/Colors'
import { Stack, useRouter } from 'expo-router'
import { Platform, Text } from 'react-native'
import {
    SafeAreaProvider,
    useSafeAreaInsets
} from 'react-native-safe-area-context'

export default function AppLayout() {
	const { top } = useSafeAreaInsets()
	const router = useRouter()
	const { submitForm, newClientFormState } = useClientStore()
	const { submitForm: submitProductForm, newProductFormState, editingProductId } = useProductStore()
	
	return (
		<SafeAreaProvider>
			<StatusBar style='light' />
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: Colors.black,
						paddingTop: top
					}
				}}
			>
				<Stack.Screen name='(tabs)' />
				<Stack.Screen name='agent/[id]'
					options={{
						headerTitle: 'Редактирование',
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
						},
						headerRight: () => (
							<Text
								style={{
									color: Platform.select({
										ios: '#007AFF', // Системный синий iOS
										android: '#2196F3' // Material Design синий
									}),
									fontSize: 17, // Стандартный размер для iOS
									fontWeight: '600' // Semibold для iOS
								}}
								onPress={() => {
									submitForm(newClientFormState)
									router.back()
								}}
							>
								Готово
							</Text>
						)
					}}
				/>
				<Stack.Screen
					name='(NewProduct)/modal'
					options={{
						headerTitle: editingProductId ? 'Редактировать товар' : 'Добавить товар',
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
						},
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
								onPress={() => {
									submitProductForm(newProductFormState)
									router.back()
								}}
							>
								Готово
							</Text>
						)
					}}
				/>
			</Stack>
		</SafeAreaProvider>
	)
}
