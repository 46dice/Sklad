import CourierPaymentCalculator from '@/components/Couriers/CourierPaymentCalculator'
import CourierPaymentHistory from '@/components/Couriers/CourierPaymentHistory'
import { CourierDeliveryReport } from '@/components/Deliveries/CourierDeliveryReport'
import { CreateDeliveryTask } from '@/components/Deliveries/CreateDeliveryTask'
import { useAuth } from '@/hooks/useAuth'
import { useCouriers } from '@/hooks/useCouriers'
import { useDeliveries } from '@/hooks/useDeliveries'
import { useTheme } from '@/providers/theme/ThemeProvider'
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
	const { colors } = useTheme()
	
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
				<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 12 }}>
					<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
						<View style={{ flex: 1 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
								<Feather name='truck' size={16} color={colors.primary} />
								<Text style={{ color: colors.text, fontWeight: '600' }}>{delivery.taskNumber}</Text>
							</View>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Курьер: {delivery.courierName}</Text>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Доставок: {totalItems} шт.</Text>
						</View>
						<View
							style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: getStatusColor(delivery.status) + '20' }}
						>
							<Text
								style={{ fontSize: 12, fontWeight: '600', color: getStatusColor(delivery.status) }}
							>
								{getStatusLabel(delivery.status)}
							</Text>
						</View>
					</View>

					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
						<Feather name='map-pin' size={14} color={colors.textSecondary} />
						<View style={{ flex: 1 }}>
							{delivery.destinationAddresses && delivery.destinationAddresses.length > 1 ? (
								<View>
									{delivery.destinationAddresses.map((addr, idx) => (
										<Text key={idx} style={{ color: colors.text, fontSize: 14 }}>
											{addr}
										</Text>
									))}
								</View>
							) : (
								<Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={1}>
									{delivery.destinationAddress}
								</Text>
							)}
						</View>
					</View>

					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
							{new Date(delivery.createdAt).toLocaleDateString('ru-RU')}
						</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
							{isManager && (
								<>
									<View style={{ alignItems: 'flex-end' }}>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Расходы:</Text>
										<Text style={{ color: colors.error, fontWeight: 'bold' }}>{courierRate}₽</Text>
									</View>
									<View style={{ alignItems: 'flex-end' }}>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Прибыль:</Text>
										<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{managerProfit}₽</Text>
									</View>
								</>
							)}
							{isCourier && (
								<View style={{ alignItems: 'flex-end' }}>
									<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{courierRate}₽</Text>
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
								{ text: 'Отмена', onPress: () => {}, style: 'cancel' },
								{ text: 'Удалить', onPress: () => onDelete(delivery.id), style: 'destructive' }
							]
						)
					}}
					style={{ backgroundColor: colors.error + '20', borderRadius: 8, padding: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.error + '30' }}
				>
					<Feather name='trash-2' size={16} color={colors.error} />
					<Text style={{ color: colors.error, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>Удалить</Text>
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
	const { colors } = useTheme()
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

	const displayedDeliveries = useMemo(() => {
		if (isCourier && user) {
			return deliveries.filter(d => d.courierId === user.uid)
		}
		return deliveries
	}, [deliveries, isCourier, user])

	const filteredDeliveries = displayedDeliveries.filter(delivery => {
		if (activeFilter !== 'all' && delivery.status !== activeFilter) return false
		if (destinationFilter !== 'all') {
			const destInfo = DESTINATIONS.find(d => d.value === destinationFilter)
			if (destInfo && destInfo.address) {
				const addresses = delivery.destinationAddresses || [delivery.destinationAddress]
				const hasMatchingAddress = addresses.some(addr => addr === destInfo.address)
				if (!hasMatchingAddress) return false
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
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{/* Header */}
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
					<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
						{viewMode === 'deliveries' ? 'Доставки' : 'История расчётов'}
					</Text>
					{isCourier ? (
						<TouchableOpacity
							onPress={() => router.push('/app/profile/profile')}
							style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
						>
							<Feather name='settings' size={20} color='white' />
						</TouchableOpacity>
					) : (
						<View style={{ flexDirection: 'row', gap: 8 }}>
							{viewMode === 'deliveries' && (
								<>
									<TouchableOpacity
										onPress={() => setViewMode('payments')}
										style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
									>
										<Feather name='list' size={20} color='white' />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setShowPaymentModal(true)}
										style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
									>
										<Feather name='credit-card' size={20} color='white' />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setShowCreateModal(true)}
										style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
									>
										<Feather name='plus' size={20} color='white' />
									</TouchableOpacity>
								</>
							)}
							{viewMode === 'payments' && (
								<TouchableOpacity
									onPress={() => setViewMode('deliveries')}
									style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
								>
									<Feather name='arrow-left' size={20} color='white' />
								</TouchableOpacity>
							)}
						</View>
					)}
				</View>

				{viewMode === 'deliveries' ? (
					<>
						{/* Filter Tabs */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={{ marginBottom: 16 }}
							contentContainerStyle={{ gap: 8 }}
						>
							{filterTabs.map(tab => (
								<TouchableOpacity
									key={tab.value}
									onPress={() => setActiveFilter(tab.value)}
									style={{
										paddingHorizontal: 16,
										paddingVertical: 8,
										borderRadius: 999,
										backgroundColor: activeFilter === tab.value ? colors.primary : colors.surface
									}}
								>
									<Text style={{ fontSize: 14, fontWeight: '600', color: activeFilter === tab.value ? '#FFFFFF' : colors.textSecondary }}>
										{tab.label}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						{/* Destination Filter */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={{ marginBottom: 16 }}
							contentContainerStyle={{ gap: 8 }}
						>
							{DESTINATIONS.map(dest => (
								<TouchableOpacity
									key={dest.value}
									onPress={() => setDestinationFilter(dest.value)}
									style={{
										paddingHorizontal: 16,
										paddingVertical: 8,
										borderRadius: 999,
										backgroundColor: destinationFilter === dest.value ? colors.primary : colors.surface
									}}
								>
									<Text style={{ fontSize: 14, fontWeight: '600', color: destinationFilter === dest.value ? '#FFFFFF' : colors.textSecondary }}>
										{dest.label}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						{/* Deliveries List */}
						{isLoading ? (
							<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
								<ActivityIndicator size='large' color={colors.primary} />
								<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Загрузка доставок...</Text>
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
									<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
										<Feather name='truck' size={48} color={colors.textSecondary} />
										<Text style={{ color: colors.textSecondary, marginTop: 16 }}>
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
			<Modal visible={showCreateModal} animationType='slide' presentationStyle='pageSheet'>
				<CreateDeliveryTask couriers={couriers.map(c => ({ id: c.id, name: c.name }))} />
				<View style={{ position: 'absolute', top: 48, right: 16, zIndex: 10 }}>
					<TouchableOpacity
						onPress={() => setShowCreateModal(false)}
						style={{ backgroundColor: colors.surface, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
					>
						<Feather name='x' size={16} color={colors.text} />
					</TouchableOpacity>
				</View>
			</Modal>

			{/* Delivery Details Modal */}
			<Modal visible={!!selectedDelivery} animationType='slide' presentationStyle='pageSheet'>
				{selectedDelivery && (
					<CourierDeliveryReport
						task={selectedDelivery}
						onReportSubmitted={() => {
							fetchDeliveries()
							setSelectedDelivery(null)
						}}
					/>
				)}
				<View style={{ position: 'absolute', top: 48, right: 16, zIndex: 10 }}>
					<TouchableOpacity
						onPress={() => {
							setSelectedDelivery(null)
							fetchDeliveries()
						}}
						style={{ backgroundColor: colors.surface, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
					>
						<Feather name='x' size={16} color={colors.text} />
					</TouchableOpacity>
				</View>
			</Modal>

			{/* Payment Calculator Modal */}
			<Modal visible={showPaymentModal} animationType='slide' presentationStyle='pageSheet'>
				<CourierPaymentCalculator
					onClose={() => setShowPaymentModal(false)}
					initialPeriodFrom={paymentPeriodFrom}
					initialPeriodTo={paymentPeriodTo}
					onPeriodsChange={(from, to) => {
						setPaymentPeriodFrom(from)
						setPaymentPeriodTo(to)
					}}
				/>
				<View style={{ position: 'absolute', top: 48, right: 16, zIndex: 10 }}>
					<TouchableOpacity
						onPress={() => setShowPaymentModal(false)}
						style={{ backgroundColor: colors.surface, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
					>
						<Feather name='x' size={16} color={colors.text} />
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	)
}

export default Deliveries
