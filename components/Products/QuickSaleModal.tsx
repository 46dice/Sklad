import { useSalesActions } from '@/components/Products/hooks/useSalesActions'
import { INewProductForm } from '@/shared/types/products.types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'

interface Props {
	product: INewProductForm & { id: string }
	isVisible: boolean
	onClose: () => void
	onSaleAdded: () => void
}

export const QuickSaleModal: FC<Props> = ({
	product,
	isVisible,
	onClose,
	onSaleAdded
}) => {
	const [quantity, setQuantity] = useState('1')
	const [isLoading, setIsLoading] = useState(false)
	const { addSale } = useSalesActions()

	const handleAddSale = async () => {
		if (!quantity || parseInt(quantity) <= 0) {
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
			setQuantity('1')
			onSaleAdded()
			onClose()
		}
	}

	return (
		<Modal
			visible={isVisible}
			transparent={true}
			animationType='slide'
			onRequestClose={onClose}
		>
			<View className='flex-1 justify-end bg-black/40'>
				<Pressable className='flex-1' onPress={onClose} />

				<View className='bg-gray-default rounded-t-2xl p-6 pb-8'>
					<View className='flex-row items-center justify-between mb-6'>
						<Text className='text-white text-xl font-bold'>Продать товар</Text>
						<Pressable onPress={onClose}>
							<Feather name='x' size={24} color='white' />
						</Pressable>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						{/* Информация о товаре */}
						<View className='bg-gray-500 rounded-lg p-4 mb-6'>
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
						<View className='mb-6'>
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
						<View className='bg-gray-500 rounded-lg p-4 mb-6 flex-row justify-between items-center'>
							<Text className='text-white font-semibold'>Итого к оплате:</Text>
							<Text className='text-primary font-bold text-2xl'>
								{(parseInt(quantity || '0') * product.price).toFixed(0)} ₽
							</Text>
						</View>

						{/* Кнопки */}
						<View className='gap-3'>
							<Button
								onPress={handleAddSale}
								isLoading={isLoading}
								disabled={isLoading || !quantity || parseInt(quantity) <= 0}
							>
								Добавить продажу
							</Button>
							<Pressable
								onPress={onClose}
								className='py-3 items-center rounded-lg bg-gray-500'
							>
								<Text className='text-white font-semibold'>Отмена</Text>
							</Pressable>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	)
}
