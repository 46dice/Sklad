import { ISale } from '@/shared/types/sales.types'
import { FC } from 'react'
import { Text, View } from 'react-native'

type Props = {
	sales: ISale[]
	title?: string
}

export const SalesTable: FC<Props> = ({ sales, title = 'Товары, проданные клиенту' }) => {
	if (sales.length === 0) return null

	const calculateTotalAmount = () => {
		return sales.reduce((sum, sale) => {
			if (sale.items && sale.items.length > 0) {
				return (
					sum +
					sale.items.reduce((itemSum, item) => itemSum + item.totalAmount, 0)
				)
			}
			return sum + (sale.totalAmount || 0)
		}, 0)
	}

	return (
		<View className='mb-4'>
			<Text className='text-white text-lg font-bold mb-3'>{title}</Text>
			<View className='bg-gray-default rounded-lg overflow-hidden'>
				{/* Заголовок таблицы */}
				<View className='flex-row bg-gray-600 p-3 border-b border-gray-500'>
					<View className='flex-1'>
						<Text className='text-white font-semibold text-xs'>Товар</Text>
					</View>
					<View className='w-16'>
						<Text className='text-white font-semibold text-xs text-right'>Кол-во</Text>
					</View>
					<View className='w-20'>
						<Text className='text-white font-semibold text-xs text-right'>Цена</Text>
					</View>
					<View className='w-20'>
						<Text className='text-white font-semibold text-xs text-right'>Сумма</Text>
					</View>
				</View>

				{/* Строки таблицы */}
				{sales.map((sale, idx) => (
					<View key={idx}>
						{/* Обработка новой структуры с массивом товаров */}
						{sale.items && sale.items.length > 0
							? sale.items.map((item, itemIdx) => (
									<View
										key={itemIdx}
										className='flex-row p-3 border-b border-gray-500'
									>
										<View className='flex-1'>
											<Text className='text-white text-sm'>
												{item.productName}
											</Text>
										</View>
										<View className='w-16'>
											<Text className='text-gray-300 text-sm text-right'>
												{item.quantity}
											</Text>
										</View>
										<View className='w-20'>
											<Text className='text-gray-300 text-sm text-right'>
												{item.price}₽
											</Text>
										</View>
										<View className='w-20'>
											<Text className='text-primary text-sm text-right font-semibold'>
												{item.totalAmount}₽
											</Text>
										</View>
									</View>
								))
							: // Для совместимости со старыми записями
							  sale.productName && (
									<View className='flex-row p-3 border-b border-gray-500'>
										<View className='flex-1'>
											<Text className='text-white text-sm'>
												{sale.productName}
											</Text>
										</View>
										<View className='w-16'>
											<Text className='text-gray-300 text-sm text-right'>
												{sale.quantity}
											</Text>
										</View>
										<View className='w-20'>
											<Text className='text-gray-300 text-sm text-right'>
												{sale.price}₽
											</Text>
										</View>
										<View className='w-20'>
											<Text className='text-primary text-sm text-right font-semibold'>
												{sale.totalAmount}₽
											</Text>
										</View>
									</View>
								)}
						{/* Дата продажи - дополнительная информация */}
						<View className='flex-row p-2 bg-gray-700 border-b border-gray-600'>
							<View className='flex-1'>
								<Text className='text-gray-400 text-xs'>
									{new Date(sale.date).toLocaleDateString('ru-RU')}
								</Text>
							</View>
						</View>
					</View>
				))}

				{/* Итого */}
				<View className='flex-row p-3 bg-gray-600 border-t border-gray-500'>
					<View className='flex-1'>
						<Text className='text-white font-semibold'>Итого:</Text>
					</View>
					<View className='w-16'></View>
					<View className='w-20'></View>
					<View className='w-20'>
						<Text className='text-primary text-sm text-right font-bold'>
							{calculateTotalAmount().toLocaleString()}₽
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
