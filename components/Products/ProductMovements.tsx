import { MovementType, useInventoryMovements } from '@/hooks/useInventoryMovements'
import { Feather } from '@expo/vector-icons'
import { FC, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

type Props = {
	productId: string
	productName: string
}

const getMovementTypeColor = (type: MovementType) => {
	switch (type) {
		case 'sale': return '#EF4444' // красный
		case 'delivery_out': return '#F59E0B' // оранжевый
		case 'delivery_in': return '#10B981' // зелёный
		case 'return': return '#3B82F6' // синий
		case 'adjustment': return '#8B5CF6' // фиолетовый
		default: return '#9CA3AF'
	}
}

const getMovementTypeLabel = (type: MovementType) => {
	const labels: Record<MovementType, string> = {
		sale: 'Продажа',
		delivery_out: 'Отправка',
		delivery_in: 'Поступление',
		return: 'Возврат',
		adjustment: 'Корректировка'
	}
	return labels[type]
}

const getMovementIcon = (type: MovementType) => {
	switch (type) {
		case 'sale': return 'shopping-cart'
		case 'delivery_out': return 'truck'
		case 'delivery_in': return 'package'
		case 'return': return 'rotate-ccw'
		case 'adjustment': return 'edit'
		default: return 'activity'
	}
}

export const ProductMovements: FC<Props> = ({ productId, productName }) => {
	const { movements, isLoading } = useInventoryMovements()

	const productMovements = useMemo(() => {
		return movements
			.filter(movement => movement.productId === productId)
			.slice(0, 10) // показываем последние 10 движений
	}, [movements, productId])

	if (isLoading) {
		return (
			<View className='bg-gray-default rounded-lg p-4'>
				<Text className='text-gray-400 text-center'>Загрузка движений...</Text>
			</View>
		)
	}

	if (productMovements.length === 0) {
		return (
			<View className='bg-gray-default rounded-lg p-4'>
				<View className='flex-row items-center mb-2'>
					<Feather name='activity' size={18} color='#BF3335' />
					<Text className='text-white font-semibold ml-2'>Движения товара</Text>
				</View>
				<Text className='text-gray-400 text-sm'>Нет движений по данному товару</Text>
			</View>
		)
	}

	return (
		<View className='bg-gray-default rounded-lg p-4'>
			<View className='flex-row items-center mb-3'>
				<Feather name='activity' size={18} color='#BF3335' />
				<Text className='text-white font-semibold ml-2'>
					Движения товара ({productMovements.length})
				</Text>
			</View>

			<ScrollView className='max-h-64' showsVerticalScrollIndicator={false}>
				{productMovements.map((movement, idx) => (
					<View 
						key={movement.id} 
						className={`flex-row items-center py-3 ${idx < productMovements.length - 1 ? 'border-b border-gray-600' : ''}`}
					>
						<View 
							className='w-8 h-8 rounded-full items-center justify-center mr-3'
							style={{ backgroundColor: getMovementTypeColor(movement.movementType) + '20' }}
						>
							<Feather 
								name={getMovementIcon(movement.movementType) as any} 
								size={14} 
								color={getMovementTypeColor(movement.movementType)} 
							/>
						</View>

						<View className='flex-1'>
							<View className='flex-row items-center justify-between mb-1'>
								<Text className='text-white font-medium text-sm'>
									{getMovementTypeLabel(movement.movementType)}
								</Text>
								<Text 
									className={`text-sm font-bold ${movement.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}
								>
									{movement.quantity > 0 ? '+' : ''}{movement.quantity}
								</Text>
							</View>
							
							<Text className='text-gray-400 text-xs mb-1'>
								{movement.previousQuantity} → {movement.newQuantity} шт
							</Text>
							
							{movement.reason && (
								<Text className='text-gray-500 text-xs' numberOfLines={1}>
									{movement.reason}
								</Text>
							)}
							
							<Text className='text-gray-500 text-xs mt-1'>
								{new Date(movement.timestamp).toLocaleString('ru-RU')}
							</Text>
						</View>
					</View>
				))}
			</ScrollView>

			{movements.filter(m => m.productId === productId).length > 10 && (
				<Text className='text-gray-500 text-xs text-center mt-2'>
					Показаны последние 10 движений
				</Text>
			)}
		</View>
	)
}