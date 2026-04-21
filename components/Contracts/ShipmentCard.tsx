import { IShipment } from '@/shared/types/shipment.types'
import { Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

interface ShipmentCardProps {
	shipment: IShipment
	onPress: () => void
	onEdit: () => void
	onDelete: () => void
	onComplete?: () => void
}

export const ShipmentCard = ({
	shipment,
	onPress,
	onEdit,
	onDelete,
	onComplete
}: ShipmentCardProps) => {
	const createdDate = new Date(shipment.createdAt).toLocaleDateString('ru-RU')
	const statusLabel = shipment.status === 'completed' ? 'Завершен' : 'Черновик'
	const statusColor = shipment.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'

	return (
		<Pressable
			onPress={onPress}
			className='bg-gray-default rounded-lg p-4 mb-3 border border-gray-600'
		>
			<View className='flex-row items-start justify-between mb-2'>
				<View className='flex-1'>
					<Text className='text-white font-bold text-base'>{shipment.actNumber}</Text>
					<Text className='text-gray-400 text-sm mt-1'>{shipment.clientName}</Text>
					<Text className='text-gray-500 text-xs mt-1'>ИНН: {shipment.clientInn}</Text>
				</View>
				<View className={`${statusColor} rounded-full px-3 py-1`}>
					<Text className='text-white text-xs font-semibold'>{statusLabel}</Text>
				</View>
			</View>

			<View className='flex-row items-center justify-between mb-3 pt-2 border-t border-gray-600'>
				<View>
					<Text className='text-gray-500 text-xs'>Сумма</Text>
					<Text className='text-primary font-bold text-lg'>
						{shipment.totalAmount.toFixed(0)}₽
					</Text>
				</View>
				<View>
					<Text className='text-gray-500 text-xs'>Услуг</Text>
					<Text className='text-white font-semibold text-lg'>
						{shipment.items.length}
					</Text>
				</View>
				<View>
					<Text className='text-gray-500 text-xs'>Дата</Text>
					<Text className='text-white font-semibold text-sm'>{createdDate}</Text>
				</View>
			</View>

			<View className='flex-row gap-2'>
				{/* <Pressable
					onPress={onEdit}
					className='flex-1 bg-blue-600 rounded-lg py-2 flex-row items-center justify-center gap-1'
				>
					<Feather name='edit-2' size={14} color='white' />
					<Text className='text-white font-semibold text-xs'>Изменить</Text>
				</Pressable> */}
				{shipment.status === 'draft' && onComplete && (
					<Pressable
						onPress={onComplete}
						className='flex-1 bg-green-600 rounded-lg py-2 flex-row items-center justify-center gap-1'
					>
						<Feather name='check' size={14} color='white' />
						<Text className='text-white font-semibold text-xs'>Завершить</Text>
					</Pressable>
				)}
				<Pressable
					onPress={onDelete}
					className='flex-1 bg-red-500 rounded-lg py-2 flex-row items-center justify-center gap-1'
				>
					<Feather name='trash-2' size={14} color='white' />
					<Text className='text-white font-semibold text-xs'>Удалить</Text>
				</Pressable>
			</View>
		</Pressable>
	)
}
