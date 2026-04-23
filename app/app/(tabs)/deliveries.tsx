import CourierPaymentCalculator from '@/components/Couriers/CourierPaymentCalculator'
import CourierPaymentHistory from '@/components/Couriers/CourierPaymentHistory'
import { CourierDeliveryReport } from '@/components/Deliveries/CourierDeliveryReport'
import { CreateDeliveryTask } from '@/components/Deliveries/CreateDeliveryTask'
import { useAuth } from '@/hooks/useAuth'
import { useCouriers } from '@/hooks/useCouriers'
import { useDeliveries } from '@/hooks/useDeliveries'
import { getDeliveryRate } from '@/shared/types/courier.types'
import { DeliveryStatus, IDeliveryTask } from '@/shared/types/delivery.types'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { FC, useCallback, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

type Props = Record<string, never>

type FilterTab = 'all' | 'pending' | 'in_transit' | 'delivered'

type DestinationFilter = 'all' | 'ozon' | 'wildberries' | 'yandex' | 'transport'

type ViewMode = 'deliveries' | 'payments'

const DESTINATIONS: Array<{ value: DestinationFilter; label: string; address: string }> = [
	{ value: 'all', label: 'Все адреса', address: '' },
	{ value: 'ozon', label: 'Озон', address: 'Озон, ул. Челюскинцев, 88' },
	{ value: 'wildberries', label: 'Wildberries', address: 'Wildberries, ул. Машиностроителей, 32' },
	{ value: 'yandex', label: 'Яндекс.Маркет', address: 'Яндекс.Маркет, ул. Авторская, 15' },
	{ value: 'transport', label: 'Транспортные', address: 'Крупногабарит с транспортной компании' }
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

// Функция для определения адреса по названию услуги
const getAddressByServiceName = (serviceName: string): string => {
	const lowerName = serviceName.toLowerCase()
	
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
	
	return 'Озон, ул. Челюскинцев, 88' // По умолчанию
}


const DeliveryCard: FC<{ 
	delivery: IDeliveryTask
	onPress: () => void
	onDelete?: (id: string) => void
	isManager?: boolean
	isCourier?: boolean
}> = ({ delivery, onPress, onDelete, isManager, isCourier }) => {
	const totalItems = delivery.items.reduce((sum, item) => sum + item.quantity, 0)
	
	// Рассчитываем зарплату курьера: количество × тариф за каждый товар
	const calculateCourierEarnings = (): number => {
		let totalEarnings = 0
		
		delivery.items.forEach(item => {
			const itemAddress = getAddressByServiceName(item.productName)
			const itemRate = getDeliveryRate(itemAddress)
			// Зарплата = тариф × количество товаров
			totalEarnings += itemRate * item.quantity
		})
		
		return totalEarnings
	}
	
	const courierRate = calculateCourierEarnings()
	// Прибыль менеджера = стоимость услуги - зарплата курьера
	const managerProfit = delivery.totalCost - courierRate

	return (
		<View>
			<TouchableOpacity onPress={onPress}>
				<View className='bg-gray-default rounded-lg p-4 mb-3'>
					<View className='flex-row items-start justify-between mb-2'>
						<View className='flex-1'>
							<View className='flex-row items-center gap-2 mb-1'>
								<Feather name='truck' size={16} color='#BF3335' />
								<Text className='text-white font-semibold'>{delivery.taskNumber}</Text>
							</View>
							<Text className='text-gray-400 text-sm'>Курьер: {delivery.courierName}</Text>
							<Text className='text-gray-400 text-sm'>Доставок: {totalItems} шт.</Text>
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
						<View className='flex-1'>
							{delivery.destinationAddresses && delivery.destinationAddresses.length > 1 ? (
								<View>
									{delivery.destinationAddresses.map((addr, idx) => (
										<Text key={idx} className='text-gray-300 text-sm'>
											{addr}
										</Text>
									))}
								</View>
							) : (
								<Text className='text-gray-300 text-sm' numberOfLines={1}>
									{delivery.destinationAddress}
								</Text>
							)}
						</View>
					</View>

					<View className='flex-row items-center justify-between'>
						<Text className='text-gray-500 text-xs'>
							{new Date(delivery.createdAt).toLocaleDateString('ru-RU')}
						</Text>
						<View className='flex-row items-center gap-4'>
							{isManager && (
								<>
									<View className='items-end'>
										<Text className='text-gray-400 text-xs'>Расходы:</Text>
										<Text className='text-red-400 font-bold'>{courierRate}₽</Text>
									</View>
									<View className='items-end'>
										<Text className='text-gray-400 text-xs'>Прибыль:</Text>
										<Text className='text-primary font-bold'>{managerProfit}₽</Text>
									</View>
								</>
							)}
							{isCourier && (
								<View className='items-end'>
									<Text className='text-primary font-bold'>{courierRate}₽</Text>
								</View>
							)}
						</View>
					</View>
				</View>
			</TouchableOpacity>
			{isManager && onDelete && (
				<TouchableOpacity
					onPress={() => {
						Alert.alert(
							'Удалить доставку?',
							'Вы уверены, что хотите удалить эту доставку?',
							[
								{
									text: 'Отмена',
									onPress: () => {},
									style: 'cancel'
								},
								{
									text: 'Удалить',
									onPress: () => onDelete(delivery.id),
									style: 'destructive'
								}
							]
						)
					}}
					className='bg-red-600/20 rounded-lg p-2 mb-3 flex-row items-center justify-center border border-red-600/30'
				>
					<Feather name='trash-2' size={16} color='#EF4444' />
					<Text className='text-red-400 text-sm font-semibold ml-2'>Удалить</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

const Deliveries: FC<Props> = () => {
	const { user, userProfile } = useAuth()
	const router = useRouter()
	const { deliveries, isLoading, fetchDeliveries, deleteDelivery } = useDeliveries()
	const { couriers } = useCouriers()
	const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
	const [destinationFilter, setDestinationFilter] = useState<DestinationFilter>('all')
	const [selectedDelivery, setSelectedDelivery] = useState<IDeliveryTask | null>(null)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [showPaymentModal, setShowPaymentModal] = useState(false)
	const [viewMode, setViewMode] = useState<ViewMode>('deliveries')
	const [paymentPeriodFrom, setPaymentPeriodFrom] = useState<string>(
		new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
	)
	const [paymentPeriodTo, setPaymentPeriodTo] = useState<string>(
		new Date().toISOString().split('T')[0]
	)

	const isCourier = userProfile?.role === 'courier'

	const handleDeleteDelivery = async (taskId: string) => {
		const success = await deleteDelivery(taskId)
		if (success) {
			fetchDeliveries()
		}
	}

	useFocusEffect(
		useCallback(() => {
			fetchDeliveries()
		}, [fetchDeliveries])
	)

	// Для курьера показываем только его доставки, для менеджера - все
	const displayedDeliveries = useMemo(() => {
		if (isCourier && user) {
			return deliveries.filter(d => d.courierId === user.uid)
		}
		return deliveries
	}, [deliveries, isCourier, user])

	const filteredDeliveries = displayedDeliveries.filter(delivery => {
		// Фильтр по статусу
		if (activeFilter !== 'all' && delivery.status !== activeFilter) return false
		
		// Фильтр по адресу
		if (destinationFilter !== 'all') {
			const destInfo = DESTINATIONS.find(d => d.value === destinationFilter)
			if (destInfo && destInfo.address) {
				// Проверяем все адреса доставки
				const addresses = delivery.destinationAddresses || [delivery.destinationAddress]
				const hasMatchingAddress = addresses.some(addr => addr === destInfo.address)
				if (!hasMatchingAddress) {
					return false
				}
			}
		}
		
		return true
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
					<Text className='text-white text-2xl font-bold'>
						{viewMode === 'deliveries' ? 'Доставки' : 'История расчётов'}
					</Text>
					{isCourier ? (
						<TouchableOpacity
							onPress={() => router.push('/app/profile/profile')}
							className='bg-primary w-10 h-10 rounded-full items-center justify-center'
						>
							<Feather name='settings' size={20} color='white' />
						</TouchableOpacity>
					) : (
						<View className='flex-row gap-2'>
							{viewMode === 'deliveries' && (
								<>
									<TouchableOpacity
										onPress={() => setViewMode('payments')}
										className='bg-primary w-10 h-10 rounded-full items-center justify-center'
									>
										<Feather name='list' size={20} color='white' />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setShowPaymentModal(true)}
										className='bg-primary w-10 h-10 rounded-full items-center justify-center'
									>
										<Feather name='credit-card' size={20} color='white' />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setShowCreateModal(true)}
										className='bg-primary w-10 h-10 rounded-full items-center justify-center'
									>
										<Feather name='plus' size={20} color='white' />
									</TouchableOpacity>
								</>
							)}
							{viewMode === 'payments' && (
								<TouchableOpacity
									onPress={() => setViewMode('deliveries')}
									className='bg-primary w-10 h-10 rounded-full items-center justify-center'
								>
									<Feather name='arrow-left' size={20} color='white' />
								</TouchableOpacity>
							)}
						</View>
					)}
				</View>

				{/* Filters and Content */}
				{viewMode === 'deliveries' ? (
					<>
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

						{/* Destination Filter */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							className='mb-4'
							contentContainerStyle={{ gap: 8 }}
						>
							{DESTINATIONS.map(dest => (
								<TouchableOpacity
									key={dest.value}
									onPress={() => setDestinationFilter(dest.value)}
									className={`px-4 py-2 rounded-full ${
										destinationFilter === dest.value ? 'bg-primary' : 'bg-gray-default'
									}`}
								>
									<Text
										className={`text-sm font-semibold ${
											destinationFilter === dest.value ? 'text-white' : 'text-gray-400'
										}`}
									>
										{dest.label}
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
											onDelete={!isCourier ? handleDeleteDelivery : undefined}
											isManager={!isCourier}
											isCourier={isCourier}
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
					</>
				) : (
					<CourierPaymentHistory />
				)}
			</ScrollView>

			{/* Create Delivery Modal */}
			<Modal
				visible={showCreateModal}
				animationType='slide'
				presentationStyle='pageSheet'
			>
				<CreateDeliveryTask
					couriers={couriers.map(c => ({ id: c.id, name: c.name }))}
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
							// Фоновый рефетч без показа лоадера
							fetchDeliveries()
							setSelectedDelivery(null)
						}}
					/>
				)}
				<View className='absolute top-12 right-4 z-10'>
					<TouchableOpacity
						onPress={() => {
							setSelectedDelivery(null)
							// Фоновый рефетч
							fetchDeliveries()
						}}
						className='bg-gray-600 w-8 h-8 rounded-full items-center justify-center'
					>
						<Feather name='x' size={16} color='white' />
					</TouchableOpacity>
				</View>
			</Modal>

			{/* Payment Calculator Modal */}
			<Modal
				visible={showPaymentModal}
				animationType='slide'
				presentationStyle='pageSheet'
			>
				<CourierPaymentCalculator 
					onClose={() => setShowPaymentModal(false)}
					initialPeriodFrom={paymentPeriodFrom}
					initialPeriodTo={paymentPeriodTo}
					onPeriodsChange={(from, to) => {
						setPaymentPeriodFrom(from)
						setPaymentPeriodTo(to)
					}}
				/>
				<View className='absolute top-12 right-4 z-10'>
					<TouchableOpacity
						onPress={() => setShowPaymentModal(false)}
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
