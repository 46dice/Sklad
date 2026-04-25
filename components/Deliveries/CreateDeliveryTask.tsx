import { useProducts } from '@/components/Products/hooks/useProducts'
import { useDeliveries } from '@/hooks/useDeliveries'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { DELIVERY_RATES } from '@/shared/types/courier.types'
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

// Генерируем DESTINATIONS из DELIVERY_RATES
const DESTINATIONS: Array<{ value: DeliveryDestination; label: string; address: string }> = [
	...Object.entries(DELIVERY_RATES).map(([address, rate], idx) => ({
		value: `destination_${idx}` as DeliveryDestination,
		label: address.split(',')[0], // Берём первую часть адреса как название
		address
	}))
]

export const CreateDeliveryTask: FC<Props> = ({ couriers }) => {
	const router = useRouter()
	const { products } = useProducts()
	const { createDeliveryTask } = useDeliveries()
	const { colors } = useTheme()
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
	const [selectedProducts, setSelectedProducts] = useState<Array<{
		id: string
		name: string
		quantity: number
		deliveryCost: number
	}>>([])

	// Фильтруем товары - только те, что содержат слово "доставка"
	const deliveryProducts = products.filter(p => 
		p.name.toLowerCase().includes('доставка')
	)

	// Функция для автоматического определения адреса по названию услуги
	const getAddressByServiceName = (serviceName: string): string => {
		const lowerName = serviceName.toLowerCase()
		
		// Проверяем ключевые слова для каждого маркетплейса
		if (lowerName.includes('озон')) {
			return 'Озон, ул. Челюскинцев, 88'
		}
		if (lowerName.includes('wildberries') || lowerName.includes('вб') || lowerName.includes('wb')) {
			return 'Wildberries, ул. Машиностроителей, 32'
		}
		if (lowerName.includes('яндекс') || lowerName.includes('яндекс.маркет')) {
			return 'Яндекс.Маркет, ул. Авторская, 15'
		}
		if (lowerName.includes('пэк') || lowerName.includes('cdek') || lowerName.includes('деловые') || lowerName.includes('энергия')) {
			return 'Крупногабарит с транспортной компании'
		}
		
		// По умолчанию первый адрес
		return Object.keys(DELIVERY_RATES)[0]
	}

	const handleSelectCourier = (courierId: string, courierName: string) => {
		setFormData(prev => ({ ...prev, courierId, courierName }))
		setShowCourierDropdown(false)
	}

	const handleProductQuantityChange = (productId: string, quantity: number, deliveryCost: number) => {
		if (quantity <= 0) {
			setSelectedProducts(prev => prev.filter(p => p.id !== productId))
		} else {
			const product = products.find(p => p.id === productId)
			if (product) {
				setSelectedProducts(prev => {
					const existing = prev.find(p => p.id === productId)
					const isFirstProduct = prev.length === 0
					
					// Если это первый товар, автоматически выбираем адрес по названию услуги
					if (isFirstProduct && quantity > 0) {
						const autoAddress = getAddressByServiceName(product.name)
						setFormData(prevForm => ({
							...prevForm,
							destinationAddress: autoAddress
						}))
					}
					
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
			destinationAddress: formData.destinationAddress,
			destinationAddresses: uniqueAddresses, // Сохраняем все адреса
			items,
			notes: formData.notes || undefined
		})

		setIsLoading(false)

		if (success) {
			router.back()
		}
	}

	const totalCost = selectedProducts.reduce((sum, p) => sum + (p.quantity * p.deliveryCost), 0)

	// Получаем уникальные адреса доставки из выбранных товаров
	const getUniqueAddresses = (): string[] => {
		const addresses = new Set<string>()
		selectedProducts.forEach(product => {
			const address = getAddressByServiceName(product.name)
			addresses.add(address)
		})
		return Array.from(addresses)
	}

	const uniqueAddresses = getUniqueAddresses()

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Новое задание на доставку</Text>

				{/* Выбор курьера */}
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Курьер *</Text>
					<TouchableOpacity
						onPress={() => setShowCourierDropdown(!showCourierDropdown)}
						style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
					>
						<Text style={{ fontSize: 16, color: formData.courierName ? colors.text : colors.textSecondary }}>
							{formData.courierName || 'Выберите курьера'}
						</Text>
						<Feather name={showCourierDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
					</TouchableOpacity>

					{showCourierDropdown && (
						<View style={{ backgroundColor: colors.surface, marginTop: 4, borderRadius: 8, overflow: 'hidden' }}>
							{couriers.map(courier => (
								<TouchableOpacity
									key={courier.id}
									onPress={() => handleSelectCourier(courier.id, courier.name)}
									style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
								>
									<Text style={{ color: colors.text }}>{courier.name}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Адрес доставки */}
				{selectedProducts.length > 0 && (
					<View style={{ marginBottom: 16 }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Адреса доставки</Text>
						<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
							{uniqueAddresses.map((address, idx) => (
								<View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottomWidth: idx < uniqueAddresses.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
									<Feather name='map-pin' size={14} color={colors.primary} style={{ marginTop: 2 }} />
									<Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{address}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Товары */}
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Позиции *</Text>
					<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
						{deliveryProducts.length > 0 ? (
							deliveryProducts.map(product => {
								const selected = selectedProducts.find(p => p.id === product.id)
								return (
									<View key={product.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
										<View style={{ flex: 1 }}>
											<Text style={{ color: colors.text, fontWeight: '500', fontSize: 14 }}>{product.name}</Text>
										</View>
										<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
											<TouchableOpacity
												onPress={() => handleProductQuantityChange(product.id, Math.max(0, (selected?.quantity || 0) - 1), selected?.deliveryCost || product.price)}
												style={{ backgroundColor: colors.border, width: 28, height: 28, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}
											>
												<Text style={{ color: colors.text }}>−</Text>
											</TouchableOpacity>
											<Text style={{ color: colors.text, fontWeight: '600', width: 32, textAlign: 'center' }}>
												{selected?.quantity || 0}
											</Text>
											<TouchableOpacity
												onPress={() => handleProductQuantityChange(product.id, (selected?.quantity || 0) + 1, selected?.deliveryCost || product.price)}
												style={{ backgroundColor: colors.primary, width: 28, height: 28, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}
											>
												<Text style={{ color: 'white' }}>+</Text>
											</TouchableOpacity>
										</View>
										<View style={{ width: 80 }}>
											<TextInput
												style={{ color: colors.text }}
												placeholder={`${product.price}₽`}
												placeholderTextColor={colors.textSecondary}
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
							})
						) : (
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Нет доступных услуг доставки</Text>
						)}
					</View>
				</View>

				{/* Выбранные товары */}
				{selectedProducts.length > 0 && (
					<View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
						<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>К доставке</Text>
						{selectedProducts.map(product => (
							<View key={product.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{product.name}</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14, width: 48, textAlign: 'center' }}>{product.quantity}</Text>
								<Text style={{ color: colors.primary, fontSize: 14, width: 64, textAlign: 'right', fontWeight: '600' }}>
									{(product.quantity * product.deliveryCost).toFixed(0)}₽
								</Text>
							</View>
						))}
						<View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={{ color: colors.text, fontWeight: '600' }}>Общая стоимость:</Text>
							<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>{totalCost.toFixed(0)}₽</Text>
						</View>
					</View>
				)}

				{/* Заметки */}
				<View style={{ marginBottom: 24 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Заметки</Text>
					<TextInput
						style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
						placeholder='Дополнительная информация для курьера...'
						placeholderTextColor={colors.textSecondary}
						multiline
						numberOfLines={3}
						value={formData.notes}
						onChangeText={val => setFormData(prev => ({ ...prev, notes: val }))}
					/>
				</View>

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