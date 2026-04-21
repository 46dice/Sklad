import { ProductMovements } from '@/components/Products/ProductMovements'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = Record<string, never>

const ProductDetail: FC<Props> = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { products } = useProducts()

	const product = useMemo(() => {
		return products.find(p => p.id === id)
	}, [products, id])

	if (!product) {
		return (
			<View className='flex-1 bg-black'>
				<View className='flex-row items-center p-4 border-b border-gray-700'>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name='arrow-left' size={24} color='white' />
					</TouchableOpacity>
					<Text className='text-white text-lg font-semibold ml-4'>Товар</Text>
				</View>
				<View className='flex-1 items-center justify-center'>
					<Text className='text-gray-400'>Товар не найден</Text>
				</View>
			</View>
		)
	}

	const isLowStock = product.quantity <= 5

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			{/* Header */}
			<View className='flex-row items-center justify-between mb-6'>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name='arrow-left' size={24} color='white' />
				</TouchableOpacity>
				<Text className='text-white text-xl font-bold flex-1 ml-4'>
					{product.name}
				</Text>
			</View>

			{/* Product Info */}
			<View className='bg-gray-default rounded-lg p-4 mb-4'>
				<View className='flex-row items-start justify-between mb-4'>
					<View className='flex-1'>
						<Text className='text-white text-2xl font-bold mb-2'>{product.name}</Text>
						<Text className='text-gray-400 text-sm mb-1'>SKU: {product.sku}</Text>
						{product.category && (
							<Text className='text-gray-400 text-sm mb-1'>Категория: {product.category}</Text>
						)}
					</View>
					<View className='items-end'>
						<Text className='text-primary text-2xl font-bold'>{product.price}₽</Text>
						<Text className='text-gray-400 text-sm'>за единицу</Text>
					</View>
				</View>

				{/* Stock Status */}
				<View className='flex-row items-center justify-between p-3 rounded-lg bg-gray-600'>
					<View className='flex-row items-center'>
						<Feather 
							name='package' 
							size={20} 
							color={isLowStock ? '#EF4444' : '#10B981'} 
						/>
						<Text className='text-white font-semibold ml-2'>Остаток на складе</Text>
					</View>
					<View className='flex-row items-center'>
						<Text 
							className={`text-2xl font-bold ${isLowStock ? 'text-red-400' : 'text-green-400'}`}
						>
							{product.quantity}
						</Text>
						<Text className='text-gray-400 ml-1'>шт</Text>
					</View>
				</View>

				{isLowStock && (
					<View className='bg-red-600/20 rounded-lg p-3 border border-red-600/30 mt-3'>
						<View className='flex-row items-center gap-2'>
							<Feather name='alert-triangle' size={18} color='#EF4444' />
							<Text className='text-red-400 font-semibold'>Низкий остаток</Text>
						</View>
						<Text className='text-red-300 text-sm mt-1'>
							Рекомендуется пополнить запас товара
						</Text>
					</View>
				)}

				{/* Description */}
				{product.description && (
					<View className='mt-4'>
						<Text className='text-gray-300 text-sm font-medium mb-2'>Описание</Text>
						<Text className='text-gray-400 text-sm leading-5'>{product.description}</Text>
					</View>
				)}
			</View>

			{/* Product Movements */}
			<ProductMovements productId={product.id} productName={product.name} />

			{/* Actions */}
			<View className='gap-3 mt-6'>
				<TouchableOpacity
					onPress={() => router.push({
						pathname: '/app/(QuickSale)/modal',
						params: { product: JSON.stringify(product) }
					})}
					className='bg-primary p-4 rounded-lg flex-row items-center justify-center'
				>
					<Feather name='shopping-cart' size={20} color='white' />
					<Text className='text-white font-bold text-lg ml-2'>Продать товар</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => {
						// TODO: Открыть форму редактирования товара
						alert('Функция редактирования будет добавлена позже')
					}}
					className='bg-gray-600 p-4 rounded-lg flex-row items-center justify-center'
				>
					<Feather name='edit' size={20} color='white' />
					<Text className='text-white font-bold text-lg ml-2'>Редактировать</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default ProductDetail