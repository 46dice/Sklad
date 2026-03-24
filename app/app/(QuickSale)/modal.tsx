import { useSales } from '@/components/Products/hooks/useSales'
import { useSalesActions } from '@/components/Products/hooks/useSalesActions'
import { INewProductForm } from '@/shared/types/products.types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function QuickSaleModal() {
	const router = useRouter()
	const params = useLocalSearchParams()
	const [quantity, setQuantity] = useState('1')
	const [isLoading, setIsLoading] = useState(false)
	const [product, setProduct] = useState<INewProductForm & { id: string } | null>(null)
	const { addSale } = useSalesActions()
	const { fetchSales } = useSales()

	useEffect(() => {
		if (params.product) {
			try {
				const parsedProduct = JSON.parse(params.product as string)
				setProduct(parsedProduct)
			} catch (e) {
				console.error('Failed to parse product:', e)
			}
		}
	}, [params.product])

	const handleAddSale = async () => {
		if (!product || !quantity || parseInt(quantity) <= 0) {
			return
		}

		setIsLoading(true)
		const qty = parseInt(quantity)
		const totalAmount = qty * product.price

		const success = await addSale({
			productId: product.id,
			productName: product.name,
			quantity: qty,
			price: product.price,
			totalAmount
		})

		setIsLoading(false)

		if (success) {
			await fetchSales()
			router.back()
		}
	}

	if (!product) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Text className='text-white'>Загрузка...</Text>
			</View>
		)
	}

	return (
		<ScrollView className='flex-1' contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
			<View className='gap-6 mt-6'>
				{/* Информация о товаре */}
				<View className='bg-gray-500 rounded-lg p-4'>
					<Text className='text-white font-semibold text-lg'>
						{product.name}
					</Text>
					<Text className='text-gray-500 text-sm mt-2'>SKU: {product.sku}</Text>
					<View className='flex-row justify-between mt-3'>
						<View>
							<Text className='text-gray-500 text-xs'>Цена за единицу</Text>
							<Text className='text-white font-semibold text-lg'>
								{product.price} ₽
							</Text>
						</View>
						<View>
							<Text className='text-gray-500 text-xs'>В наличии</Text>
							<Text className='text-white font-semibold text-lg'>
								{product.quantity}
							</Text>
						</View>
					</View>
				</View>

				{/* Количество */}
				<View>
					<Text className='text-white font-semibold mb-3'>Количество</Text>
					<Input
						placeholder='Введите количество'
						value={quantity}
						onChangeText={setQuantity}
						keyboardType='number-pad'
					/>
					<Text className='text-gray-500 text-sm mt-2'>
						Макс. доступно: {product.quantity}
					</Text>
				</View>

				{/* Итого */}
				<View className='bg-gray-500 rounded-lg p-4 flex-row justify-between items-center'>
					<Text className='text-white font-semibold'>Итого к оплате:</Text>
					<Text className='text-primary font-bold text-2xl'>
						{(parseInt(quantity || '0') * product.price).toFixed(0)} ₽
					</Text>
				</View>

				{/* Кнопка */}
				<Button
					onPress={handleAddSale}
					isLoading={isLoading}
					disabled={isLoading || !quantity || parseInt(quantity) <= 0}
				>
					Добавить продажу
				</Button>
			</View>
		</ScrollView>
	)
}
