import { useProducts } from '@/components/Products/hooks/useProducts'
import { useSales } from '@/components/Products/hooks/useSales'
import { useSalesActions } from '@/components/Products/hooks/useSalesActions'
import { useClients } from '@/hooks/useClients'
import { ISaleItem } from '@/shared/types/sales.types'
import { Button } from '@/shared/ui/Button'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface SelectedProduct {
	id: string
	name: string
	price: number
	quantity: number
}

export default function QuickSaleModal() {
	const router = useRouter()
	const params = useLocalSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
	const [selectedClientId, setSelectedClientId] = useState<string>('')
	const [selectedClientName, setSelectedClientName] = useState<string>('')
	const [showClientDropdown, setShowClientDropdown] = useState(false)
	const { addSale } = useSalesActions()
	const { fetchSales } = useSales()
	const { clients } = useClients()
	const { products } = useProducts()

	useEffect(() => {
		if (params.product) {
			try {
				const parsedProduct = JSON.parse(params.product as string)
				// Если передан конкретный товар, добавляем его в список с количеством 1
				setSelectedProducts([
					{
						id: parsedProduct.id,
						name: parsedProduct.name,
						price: parsedProduct.price,
						quantity: 1
					}
				])
			} catch (e) {
				console.error('Failed to parse product:', e)
			}
		}
	}, [params.product])

	const handleSelectClient = (clientId: string, clientName: string) => {
		setSelectedClientId(clientId)
		setSelectedClientName(clientName)
		setShowClientDropdown(false)
	}

	const handleProductQuantityChange = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			// Удаляем товар, если количество 0
			setSelectedProducts(prev => prev.filter(p => p.id !== productId))
		} else {
			// Обновляем или добавляем товар
			setSelectedProducts(prev => {
				const existing = prev.find(p => p.id === productId)
				if (existing) {
					return prev.map(p => (p.id === productId ? { ...p, quantity } : p))
				}
				// Добавляем новый товар
				const product = products.find(p => p.id === productId)
				if (product) {
					return [...prev, { id: productId, name: product.name, price: product.price, quantity }]
				}
				return prev
			})
		}
	}

	const handleAddSale = async () => {
		if (selectedProducts.length === 0) {
			alert('Выберите хотя бы один товар')
			return
		}

		if (!selectedClientId) {
			alert('Выберите клиента')
			return
		}

		setIsLoading(true)

		// Создаем items из выбранных товаров
		const items: ISaleItem[] = selectedProducts.map(product => ({
			productId: product.id,
			productName: product.name,
			quantity: product.quantity,
			price: product.price,
			totalAmount: product.quantity * product.price
		}))

		const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)

		const success = await addSale({
			clientId: selectedClientId,
			clientName: selectedClientName,
			items,
			totalAmount
		})

		setIsLoading(false)

		if (success) {
			await fetchSales()
			router.back()
		}
	}

	const totalSum = selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0)

	if (!products || products.length === 0) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Text className='text-white'>Загрузка товаров...</Text>
			</View>
		)
	}

	return (
		<ScrollView className='flex-1' contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
			<View className='gap-6 mt-6'>
				{/* Выбор клиента */}
				<View>
					<Text className='text-white font-semibold mb-3'>Клиент *</Text>
					<TouchableOpacity
						onPress={() => setShowClientDropdown(!showClientDropdown)}
						className='bg-gray-500 p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text
							className={`text-base ${selectedClientName ? 'text-white' : 'text-gray-500'}`}
						>
							{selectedClientName || 'Выберите клиента'}
						</Text>
						<Feather
							name={showClientDropdown ? 'chevron-up' : 'chevron-down'}
							size={20}
							color='#666'
						/>
					</TouchableOpacity>

					{showClientDropdown && (
						<View className='bg-gray-500 mt-1 rounded-lg overflow-hidden max-h-64'>
							{clients.map(client => (
								<TouchableOpacity
									key={client.id}
									onPress={() => handleSelectClient(client.id, client.name)}
									className='p-3 border-b border-gray-400'
								>
									<Text className='text-white'>{client.name}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Товары */}
				<View>
					<Text className='text-white font-semibold mb-3'>Товары *</Text>
					<View className='gap-2 bg-gray-500 rounded-lg p-3'>
						{products.map(product => (
							<View key={product.id} className='flex-row items-center gap-2 pb-2 border-b border-gray-400 last:border-b-0'>
								<View className='flex-1'>
									<Text className='text-white font-medium text-sm'>{product.name}</Text>
									<Text className='text-gray-400 text-xs'>{product.price} ₽/шт</Text>
								</View>
								<TouchableOpacity
									onPress={() => handleProductQuantityChange(product.id, (selectedProducts.find(p => p.id === product.id)?.quantity || 0) - 1)}
									className='bg-gray-600 w-7 h-7 rounded items-center justify-center'
								>
									<Text className='text-white text-lg'>−</Text>
								</TouchableOpacity>
								<Text className='text-white font-semibold w-8 text-center'>
									{selectedProducts.find(p => p.id === product.id)?.quantity || 0}
								</Text>
								<TouchableOpacity
									onPress={() => handleProductQuantityChange(product.id, (selectedProducts.find(p => p.id === product.id)?.quantity || 0) + 1)}
									className='bg-primary w-7 h-7 rounded items-center justify-center'
								>
									<Text className='text-white text-lg'>+</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>
				</View>

				{/* Таблица выбранных товаров */}
				{selectedProducts.length > 0 && (
					<View className='bg-gray-500 rounded-lg p-4'>
						<Text className='text-white font-semibold mb-3'>Выбранные товары</Text>
						<View className='flex-row pb-2 mb-2 border-b border-gray-400'>
							<Text className='flex-1 text-gray-400 text-xs font-semibold'>Товар</Text>
							<Text className='w-12 text-gray-400 text-xs font-semibold text-center'>Кол-во</Text>
							<Text className='w-16 text-gray-400 text-xs font-semibold text-right'>Цена</Text>
							<Text className='w-16 text-gray-400 text-xs font-semibold text-right'>Сумма</Text>
						</View>
						{selectedProducts.map(product => (
							<View key={product.id} className='flex-row pb-2 items-center'>
								<Text className='flex-1 text-white text-xs'>{product.name}</Text>
								<Text className='w-12 text-white text-xs text-center'>{product.quantity}</Text>
								<Text className='w-16 text-white text-xs text-right'>{product.price}₽</Text>
								<Text className='w-16 text-primary text-xs text-right font-semibold'>
									{(product.quantity * product.price).toFixed(0)}₽
								</Text>
							</View>
						))}
					</View>
				)}

				{/* Итого */}
				<View className='bg-gray-500 rounded-lg p-4 flex-row justify-between items-center'>
					<Text className='text-white font-semibold'>Итого к оплате:</Text>
					<Text className='text-primary font-bold text-2xl'>
						{totalSum.toFixed(0)} ₽
					</Text>
				</View>

				{/* Кнопка */}
				<Button
					onPress={handleAddSale}
					isLoading={isLoading}
					disabled={isLoading || selectedProducts.length === 0 || !selectedClientId}
				>
					Добавить продажу
				</Button>
			</View>
		</ScrollView>
	)
}
