import { CourierDeliveryReport } from '@/components/Deliveries/CourierDeliveryReport'
import { CreateDeliveryTask } from '@/components/Deliveries/CreateDeliveryTask'
import { useDeliveries } from '@/hooks/useDeliveries'
import { DeliveryStatus, IDeliveryTask } from '@/shared/types/delivery.types'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback, useState } from 'react'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

type Props = Record<string, never>

type FilterTab = 'all' | 'pending' | 'in_transit' | 'delivered'

// Моковые курьеры (в реальном приложении это будет из базы)
const MOCK_COURIERS = [
	{ id: 'courier1', name: 'Иван Петров' },
	{ id: 'courier2', name: 'Мария Сидорова' },
	{ id: 'courier3', name: 'Алексей Козлов' }
]

const getStatusColor = (status: DeliveryStatus) => {
	switch (status) {
		case 'pending': return '#F59E0B'
		case 'in_transit': return '#3B82F6'
		case 'delivered': return '#10B981'
		case 'failed': return '#EF4444'
		default: return '#9CA3AF'
	}
}

const getStatusLabel = (status: DeliveryStatus) => {
	const labels: Record<DeliveryStatus, string> = {
		pending: 'Ожидает',
		in_transit: 'В пути',
		delivered: 'Доставлено',
		failed: 'Не доставлено'
	}
	return labels[status]
}

const DeliveryCard: FC<{ 
	delivery: IDeliveryTask
	onPress: () => void
}> = ({ delivery, onPress }) => {
	const totalItems = delivery.items.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<TouchableOpacity onPress={onPress}>
			<View className='bg-gray-default rounded-lg p-4 mb-3'>
				<View className='flex-row items-start justify-between mb-2'>
					<View className='flex-1'>
						<View className='flex-row items-center gap-2 mb-1'>
							<Feather name='truck' size={16} color='#BF3335' />
							<Text className='text-white font-semibold'>{delivery.taskNumber}</Text>
						</View>
						<Text className='text-gray-400 text-sm'>Курьер: {delivery.courierName}</Text>
						<Text className='text-gray-400 text-sm'>Товаров: {totalItems} шт.</Text>
					</View>
					<View
						className='px-3 py-1 rounded-full'
						style={{ backgroundColor: getStatusColor(delivery.status) + '20' }}
					>
						<Text
							className='text-xs font-semibold'
							style={{ color: getStatusColor(delivery.status) }}
						>
							{getStatusLabel(delivery.status)}
						</Text>
					</View>
				</View>

				<View className='flex-row items-center gap-2 mb-2'>
					<Feather name='map-pin' size={14} color='#666' />
					<Text className='text-gray-300 text-sm flex-1' numberOfLines={1}>
						{delivery.destinationAddress}
					</Text>
				</View>

				<View className='flex-row items-center justify-between'>
					<Text className='text-gray-500 text-xs'>
						{new Date(delivery.createdAt).toLocaleDateString('ru-RU')}
					</Text>
					<Text className='text-primary font-bold'>{delivery.totalCost}₽</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const Deliveries: FC<Props> = () => {
	const { deliveries, isLoading, fetchDeliveries } = useDeliveries()
	const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [selectedDelivery, setSelectedDelivery] = useState<IDeliveryTask | null>(null)

	useFocusEffect(
		useCallback(() => {
			fetchDeliveries()
		}, [fetchDeliveries])
	)

	const filteredDeliveries = deliveries.filter(delivery => {
		if (activeFilter === 'all') return true
		return delivery.status === activeFilter
	})

	const filterTabs: Array<{ label: string; value: FilterTab }> = [
		{ label: 'Все', value: 'all' },
		{ label: 'Ожидают', value: 'pending' },
		{ label: 'В пути', value: 'in_transit' },
		{ label: 'Доставлено', value: 'delivered' }
	]

	const handleDeliveryPress = (delivery: IDeliveryTask) => {
		setSelectedDelivery(delivery)
	}

	return (
		<View className='flex-1 bg-black'>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{/* Header */}
				<View className='flex-row items-center justify-between mb-6'>
					<Text className='text-white text-2xl font-bold'>Доставки</Text>
					<TouchableOpacity
						onPress={() => setShowCreateModal(true)}
						className='bg-primary w-10 h-10 rounded-full items-center justify-center'
					>
						<Feather name='plus' size={20} color='white' />
					</TouchableOpacity>
				</View>

				{/* Filter Tabs */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className='mb-4'
					contentContainerStyle={{ gap: 8 }}
				>
					{filterTabs.map(tab => (
						<TouchableOpacity
							key={tab.value}
							onPress={() => setActiveFilter(tab.value)}
							className={`px-4 py-2 rounded-full ${
								activeFilter === tab.value ? 'bg-primary' : 'bg-gray-default'
							}`}
						>
							<Text
								className={`text-sm font-semibold ${
									activeFilter === tab.value ? 'text-white' : 'text-gray-400'
								}`}
							>
								{tab.label}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Deliveries List */}
				{isLoading ? (
					<View className='items-center justify-center py-12'>
						<ActivityIndicator size='large' color='#BF3335' />
						<Text className='text-gray-400 mt-4'>Загрузка доставок...</Text>
					</View>
				) : (
					<View>
						{filteredDeliveries.length > 0 ? (
							filteredDeliveries.map(delivery => (
								<DeliveryCard
									key={delivery.id}
									delivery={delivery}
									onPress={() => handleDeliveryPress(delivery)}
								/>
							))
						) : (
							<View className='items-center justify-center py-12'>
								<Feather name='truck' size={48} color='#666' />
								<Text className='text-gray-500 mt-4'>
									{activeFilter === 'all'
										? 'Нет заданий на доставку'
										: `Нет доставок со статусом "${filterTabs.find(t => t.value === activeFilter)?.label}"`}
								</Text>
							</View>
						)}
					</View>
				)}
			</ScrollView>

			{/* Create Delivery Modal */}
			<Modal
				visible={showCreateModal}
				animationType='slide'
				presentationStyle='pageSheet'
			>
				<CreateDeliveryTask
					couriers={MOCK_COURIERS}
				/>
				<View className='absolute top-12 right-4 z-10'>
					<TouchableOpacity
						onPress={() => setShowCreateModal(false)}
						className='bg-gray-600 w-8 h-8 rounded-full items-center justify-center'
					>
						<Feather name='x' size={16} color='white' />
					</TouchableOpacity>
				</View>
			</Modal>

			{/* Delivery Details Modal */}
			<Modal
				visible={!!selectedDelivery}
				animationType='slide'
				presentationStyle='pageSheet'
			>
				{selectedDelivery && (
					<CourierDeliveryReport
						task={selectedDelivery}
						onReportSubmitted={() => {
							fetchDeliveries() // Обновляем список при любом изменении статуса
						}}
					/>
				)}
				<View className='absolute top-12 right-4 z-10'>
					<TouchableOpacity
						onPress={() => {
							setSelectedDelivery(null)
							fetchDeliveries() // Обновляем данные при закрытии модала
						}}
						className='bg-gray-600 w-8 h-8 rounded-full items-center justify-center'
					>
						<Feather name='x' size={16} color='white' />
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	)
}

export default Deliveries