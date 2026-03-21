import { INewProductForm } from '@/shared/types/products.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import useProductStore from './product.model'
import { QuickSaleModal } from './QuickSaleModal'

interface ProductListProps {
	products: (INewProductForm & { id?: string })[]
	isLoading: boolean
	onEdit: (product: INewProductForm & { id: string }) => void
	onDelete: (product: INewProductForm & { id: string }) => void
}

export default function ProductList({
	products,
	isLoading,
	onEdit,
	onDelete
}: ProductListProps) {
	const router = useRouter()
	const { setEditingProductId, updateFormState } = useProductStore()
	const [saleModalVisible, setSaleModalVisible] = useState(false)
	const [selectedProductForSale, setSelectedProductForSale] = useState<
		(INewProductForm & { id: string }) | null
	>(null)

	const handleEditPress = (product: INewProductForm & { id: string }) => {
		setEditingProductId(product.id)
		updateFormState(product)
		router.push('/app/(NewProduct)/modal')
	}

	const handleQuickSale = (product: INewProductForm & { id: string }) => {
		setSelectedProductForSale(product)
		setSaleModalVisible(true)
	}

	if (isLoading) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Text className='text-white'>Загрузка товаров...</Text>
			</View>
		)
	}

	if (products.length === 0) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Feather name='inbox' size={48} color='#666' />
				<Text className='text-gray-500 mt-4'>Нет товаров</Text>
				<Text className='text-gray-500 text-sm'>Добавьте первый товар</Text>
			</View>
		)
	}

	return (
		<>
			<FlatList
				data={products}
				keyExtractor={(item, index) =>
					item.id ? item.id.toString() : index.toString()
				}
				renderItem={({ item }) => (
					<View className='border-b border-gray-default px-4 py-4'>
						<View className='flex-row items-center justify-between mb-2'>
							<View className='flex-1'>
								<Text className='text-white font-semibold mb-1'>{item.name}</Text>
								<Text className='text-gray-500 text-sm'>SKU: {item.sku}</Text>
							</View>
							<Text className='text-primary font-bold'>{item.price} ₽</Text>
						</View>
						<View className='flex-row items-center justify-between mb-3'>
							<Text className='text-gray-500 text-sm'>На складе:</Text>
							<Text className='text-white font-semibold'>{item.quantity} ед.</Text>
						</View>
						{item.description && (
							<Text className='text-gray-500 text-sm mb-3'>{item.description}</Text>
						)}
						<View className='flex-row gap-2'>
							<Pressable
								onPress={() =>
									item.id && handleQuickSale({ ...item, id: item.id })
								}
								className='flex-1 bg-primary rounded-lg py-2 flex-row items-center justify-center gap-2'
							>
								<Feather name='check-circle' size={16} color='white' />
								<Text className='text-white font-semibold'>Продать</Text>
							</Pressable>
							<Pressable
								onPress={() =>
									item.id && handleEditPress({ ...item, id: item.id })
								}
								className='flex-1 bg-gray-500 rounded-lg py-2 flex-row items-center justify-center gap-2'
							>
								<Feather name='edit-2' size={16} color='white' />
								<Text className='text-white font-semibold'>Изменить</Text>
							</Pressable>
							<Pressable
								onPress={() => item.id && onDelete({ ...item, id: item.id })}
								className='flex-1 bg-red-500 rounded-lg py-2 flex-row items-center justify-center gap-2'
							>
								<Feather name='trash-2' size={16} color='white' />
								<Text className='text-white font-semibold'>Удалить</Text>
							</Pressable>
						</View>
					</View>
				)}
				scrollEnabled={true}
				contentContainerStyle={{ flexGrow: 1 }}
			/>
			{selectedProductForSale && (
				<QuickSaleModal
					product={selectedProductForSale}
					isVisible={saleModalVisible}
					onClose={() => setSaleModalVisible(false)}
					onSaleAdded={() => {
						// Обновите данные если нужно
					}}
				/>
			)}
		</>
	)
}
