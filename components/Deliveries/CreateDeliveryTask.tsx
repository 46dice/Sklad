import { useProducts } from '@/components/Products/hooks/useProducts'
import { useDeliveries } from '@/hooks/useDeliveries'
import { DeliveryDestination, IDeliveryItem, INewDeliveryForm } from '@/shared/types/delivery.types'
import { Button } from '@/shared/ui/Button'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FC, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

type Props = {
	couriers: Array<{ id: string; name: string }>
}

const DESTINATIONS: Array<{ value: DeliveryDestination; label: string; address: string }> = [
	{ value: 'ozon', label: 'Ozon', address: 'Склад Ozon, ул. Складская 1' },
	{ value: 'wildberries', label: 'Wildberries', address: 'Склад WB, ул. Логистическая 5' },
	{ value: 'yandex_market', label: 'Яндекс.Маркет', address: 'Склад Яндекс, пр. Доставочный 10' },
	{ value: 'custom', label: 'Другое', address: '' }
]

export const CreateDeliveryTask: FC<Props> = ({ couriers }) => {
	const router = useRouter()
	const { products } = useProducts()
	const { createDeliveryTask } = useDeliveries()
	const [isLoading, setIsLoading] = useState(false)

	const [formData, setFormData] = useState<INewDeliveryForm>({
		courierId: '',
		courierName: '',
		destination: 'ozon',
		destinationAddress: DESTINATIONS[0].address,
		items: [],
		notes: ''
	})

	const [showCourierDropdown, setShowCourierDropdown] = useState(false)
	const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
	const [selectedProducts, setSelectedProducts] = useState<Array<{
		id: string
		name: string
		quantity: number
		deliveryCost: number
	}>>([])

	const handleSelectCourier = (courierId: string, courierName: string) => {
		setFormData(prev => ({ ...prev, courierId, courierName }))
		setShowCourierDropdown(false)
	}

	const handleSelectDestination = (destination: DeliveryDestination) => {
		const destInfo = DESTINATIONS.find(d => d.value === destination)
		setFormData(prev => ({
			...prev,
			destination,
			destinationAddress: destInfo?.address || '',
			customDestination: destination === 'custom' ? '' : undefined
		}))
		setShowDestinationDropdown(false)
	}

	const handleProductQuantityChange = (productId: string, quantity: number, deliveryCost: number) => {
		if (quantity <= 0) {
			setSelectedProducts(prev => prev.filter(p => p.id !== productId))
		} else {
			const product = products.find(p => p.id === productId)
			if (product) {
				setSelectedProducts(prev => {
					const existing = prev.find(p => p.id === productId)
					if (existing) {
						return prev.map(p => 
							p.id === productId 
								? { ...p, quantity, deliveryCost }
								: p
						)
					}
					return [...prev, {
						id: productId,
						name: product.name,
						quantity,
						deliveryCost
					}]
				})
			}
		}
	}

	const handleSubmit = async () => {
		if (!formData.courierId || selectedProducts.length === 0) {
			alert('Выберите курьера и добавьте товары')
			return
		}

		if (formData.destination === 'custom' && !formData.customDestination) {
			alert('Укажите адрес доставки')
			return
		}

		setIsLoading(true)

		const items: IDeliveryItem[] = selectedProducts.map(p => ({
			productId: p.id,
			productName: p.name,
			quantity: p.quantity,
			price: p.deliveryCost,
			totalCost: p.quantity * p.deliveryCost
		}))

		const success = await createDeliveryTask({
			courierId: formData.courierId,
			courierName: formData.courierName,
			destination: formData.destination,
			customDestination: formData.customDestination || undefined,
			destinationAddress: formData.destination === 'custom' 
				? (formData.customDestination || formData.destinationAddress)
				: formData.destinationAddress,
			items,
			notes: formData.notes || undefined
		})

		setIsLoading(false)

		if (success) {
			router.back()
		}
	}

	const totalCost = selectedProducts.reduce((sum, p) => sum + (p.quantity * p.deliveryCost), 0)

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className='flex-1'
		>
			<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
				<Text className='text-white text-2xl font-bold mb-4'>Новое задание на доставку</Text>

				{/* Выбор курьера */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Курьер *</Text>
					<TouchableOpacity
						onPress={() => setShowCourierDropdown(!showCourierDropdown)}
						className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text className={`text-base ${formData.courierName ? 'text-white' : 'text-gray-500'}`}>
							{formData.courierName || 'Выберите курьера'}
						</Text>
						<Feather name={showCourierDropdown ? 'chevron-up' : 'chevron-down'} size={20} color='#666' />
					</TouchableOpacity>

					{showCourierDropdown && (
						<View className='bg-gray-default mt-1 rounded-lg overflow-hidden'>
							{couriers.map(courier => (
								<TouchableOpacity
									key={courier.id}
									onPress={() => handleSelectCourier(courier.id, courier.name)}
									className='p-3 border-b border-gray-600'
								>
									<Text className='text-white'>{courier.name}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Выбор места доставки */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Место доставки *</Text>
					<TouchableOpacity
						onPress={() => setShowDestinationDropdown(!showDestinationDropdown)}
						className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text className='text-white text-base'>
							{DESTINATIONS.find(d => d.value === formData.destination)?.label}
						</Text>
						<Feather name={showDestinationDropdown ? 'chevron-up' : 'chevron-down'} size={20} color='#666' />
					</TouchableOpacity>

					{showDestinationDropdown && (
						<View className='bg-gray-default mt-1 rounded-lg overflow-hidden'>
							{DESTINATIONS.map(dest => (
								<TouchableOpacity
									key={dest.value}
									onPress={() => handleSelectDestination(dest.value)}
									className='p-3 border-b border-gray-600'
								>
									<Text className='text-white font-medium'>{dest.label}</Text>
									{dest.address && <Text className='text-gray-400 text-xs mt-1'>{dest.address}</Text>}
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Адрес доставки */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Адрес доставки</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Адрес склада'
						placeholderTextColor='#666'
						value={formData.destination === 'custom' ? formData.customDestination : formData.destinationAddress}
						onChangeText={val => {
							if (formData.destination === 'custom') {
								setFormData(prev => ({ ...prev, customDestination: val }))
							} else {
								setFormData(prev => ({ ...prev, destinationAddress: val }))
							}
						}}
						editable={formData.destination === 'custom'}
					/>
				</View>

				{/* Товары */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Товары для доставки *</Text>
					<View className='bg-gray-default rounded-lg p-3'>
						{products.map(product => {
							const selected = selectedProducts.find(p => p.id === product.id)
							return (
								<View key={product.id} className='flex-row items-center gap-2 pb-3 mb-3 border-b border-gray-600 last:border-b-0 last:mb-0 last:pb-0'>
									<View className='flex-1'>
										<Text className='text-white font-medium text-sm'>{product.name}</Text>
										<Text className='text-gray-400 text-xs'>Остаток: {product.quantity} шт</Text>
									</View>
									<View className='flex-row items-center gap-2'>
										<TouchableOpacity
											onPress={() => handleProductQuantityChange(
												product.id, 
												Math.max(0, (selected?.quantity || 0) - 1),
												selected?.deliveryCost || product.price
											)}
											className='bg-gray-600 w-7 h-7 rounded items-center justify-center'
										>
											<Text className='text-white'>−</Text>
										</TouchableOpacity>
										<Text className='text-white font-semibold w-8 text-center'>
											{selected?.quantity || 0}
										</Text>
										<TouchableOpacity
											onPress={() => handleProductQuantityChange(
												product.id, 
												(selected?.quantity || 0) + 1,
												selected?.deliveryCost || product.price
											)}
											className='bg-primary w-7 h-7 rounded items-center justify-center'
										>
											<Text className='text-white'>+</Text>
										</TouchableOpacity>
									</View>
									<View className='w-20'>
										<TextInput
											className='text-white'
											placeholder={`${product.price}₽`}
											placeholderTextColor='#999'
											value={selected?.deliveryCost ? selected.deliveryCost.toString() : ''}
											onChangeText={val => {
												const cost = parseFloat(val) || product.price
												if (selected) {
													handleProductQuantityChange(product.id, selected.quantity, cost)
												}
											}}
											keyboardType='numeric'
										/>
									</View>
								</View>
							)
						})}
					</View>
				</View>

				{/* Выбранные товары */}
				{selectedProducts.length > 0 && (
					<View className='mb-4 bg-gray-default rounded-lg p-4'>
						<Text className='text-white font-semibold mb-3'>К доставке</Text>
						{selectedProducts.map(product => (
							<View key={product.id} className='flex-row justify-between items-center pb-2 mb-2 border-b border-gray-600 last:border-b-0 last:mb-0 last:pb-0'>
								<Text className='text-white text-sm flex-1'>{product.name}</Text>
								<Text className='text-gray-300 text-sm w-12 text-center'>{product.quantity}</Text>
								<Text className='text-primary text-sm w-16 text-right font-semibold'>
									{(product.quantity * product.deliveryCost).toFixed(0)}₽
								</Text>
							</View>
						))}
						<View className='mt-3 pt-3 border-t border-gray-600 flex-row justify-between'>
							<Text className='text-white font-semibold'>Общая стоимость:</Text>
							<Text className='text-primary font-bold text-lg'>{totalCost.toFixed(0)}₽</Text>
						</View>
					</View>
				)}

				{/* Заметки */}
				<View className='mb-6'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Заметки</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Дополнительная информация для курьера...'
						placeholderTextColor='#666'
						multiline
						numberOfLines={3}
						value={formData.notes}
						onChangeText={val => setFormData(prev => ({ ...prev, notes: val }))}
					/>
				</View>

				{/* Кнопка создания */}
				<Button
					onPress={handleSubmit}
					isLoading={isLoading}
					disabled={isLoading || !formData.courierId || selectedProducts.length === 0}
				>
					Создать задание
				</Button>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}