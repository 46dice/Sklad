import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useDeliveries } from '@/hooks/useDeliveries'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { getDeliveryRate } from '@/shared/types/courier.types'
import { IDeliveryTask } from '@/shared/types/delivery.types'
import { IUserProfile } from '@/shared/types/user.types'
import { Button } from '@/shared/ui/Button'
import { Feather } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore/lite'
import { FC, useEffect, useState } from 'react'
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

type Props = {
	task: IDeliveryTask
	onReportSubmitted?: () => void
}

const getStatusColor = (status: string) => {
	switch (status) {
		case 'pending': return '#F59E0B'
		case 'in_transit': return '#3B82F6'
		case 'delivered': return '#10B981'
		case 'failed': return '#EF4444'
		default: return '#9CA3AF'
	}
}

const getStatusLabel = (status: string) => {
	const labels: Record<string, string> = {
		pending: 'Ожидает',
		in_transit: 'В пути',
		delivered: 'Доставлено',
		failed: 'Не доставлено'
	}
	return labels[status] || status
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
	
	return 'Озон, ул. Челюскинцев, 88'
}

export const CourierDeliveryReport: FC<Props> = ({ task, onReportSubmitted }) => {
	const { updateDeliveryStatus, submitDeliveryReport } = useDeliveries()
	const { userProfile } = useAuth()
	const { colors } = useTheme()
	const [isLoading, setIsLoading] = useState(false)
	const [reportNotes, setReportNotes] = useState('')
	const [showReportForm, setShowReportForm] = useState(false)
	const [courierProfile, setCourierProfile] = useState<IUserProfile | null>(null)

	const isCourier = userProfile?.role === 'courier'

	useEffect(() => {
		const loadCourierProfile = async () => {
			try {
				const courierRef = doc(db, 'users', task.courierId, 'profile', 'data')
				const courierSnap = await getDoc(courierRef)
				if (courierSnap.exists()) {
					setCourierProfile(courierSnap.data() as IUserProfile)
				}
			} catch (error) {
				console.error('Ошибка при загрузке профиля курьера:', error)
			}
		}
		loadCourierProfile()
	}, [task.courierId])

	const handleStartDelivery = async () => {
		setIsLoading(true)
		const success = await updateDeliveryStatus(task.id, 'in_transit')
		setIsLoading(false)
		if (success) onReportSubmitted?.()
	}

	const handleSubmitReport = async () => {
		if (!reportNotes.trim()) {
			alert('Добавьте заметки о доставке')
			return
		}
		setIsLoading(true)
		const success = await submitDeliveryReport({
			taskId: task.id,
			deliveredAt: new Date().toISOString(),
			notes: reportNotes
		})
		setIsLoading(false)
		if (success) {
			setShowReportForm(false)
			setReportNotes('')
			onReportSubmitted?.()
		}
	}

	const handleMarkFailed = async () => {
		setIsLoading(true)
		const success = await updateDeliveryStatus(task.id, 'failed', {
			notes: reportNotes || 'Доставка не удалась'
		})
		setIsLoading(false)
		setShowReportForm(false)
		if (success) onReportSubmitted?.()
	}

	const totalItems = task.items.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			{/* Заголовок */}
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
				<Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Задание {task.taskNumber}</Text>
				<View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: getStatusColor(task.status) + '20' }}>
					<Text style={{ fontSize: 12, fontWeight: '600', color: getStatusColor(task.status) }}>
						{getStatusLabel(task.status)}
					</Text>
				</View>
			</View>

			{/* Данные курьера */}
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
					<Feather name='user' size={20} color={colors.primary} />
					<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>Курьер</Text>
				</View>
				<Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{task.courierName}</Text>
				{courierProfile?.phone && (
					<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
						<Feather name='phone' size={16} color={colors.primary} />
						<Text style={{ color: colors.text, marginLeft: 8 }}>{courierProfile.phone}</Text>
					</View>
				)}
			</View>

			{/* Места доставки */}
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
					<Feather name='map-pin' size={20} color={colors.primary} />
					<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>Места доставки</Text>
				</View>
				{task.destinationAddresses && task.destinationAddresses.length > 1 ? (
					<View>
						{task.destinationAddresses.map((address, idx) => (
							<View key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: idx < task.destinationAddresses!.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
								<Text style={{ color: colors.text }}>{address}</Text>
							</View>
						))}
					</View>
				) : (
					<>
						<Text style={{ color: colors.text, marginBottom: 8 }}>{task.destinationAddress}</Text>
						{task.customDestination && (
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{task.customDestination}</Text>
						)}
					</>
				)}
			</View>

			{/* Заказы */}
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
					<Feather name='package' size={20} color={colors.primary} />
					<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>
						Заказы ({totalItems} шт.)
					</Text>
				</View>
				{task.items.map((item, idx) => {
					const itemAddress = getAddressByServiceName(item.productName)
					const itemRate = getDeliveryRate(itemAddress)
					const itemEarnings = itemRate * item.quantity
					
					return (
						<View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text, fontSize: 14 }}>{item.productName}</Text>
							</View>
							<Text style={{ color: colors.textSecondary, fontSize: 14, width: 64, textAlign: 'center' }}>{item.quantity} шт</Text>
							<Text style={{ color: colors.primary, fontSize: 14, width: 80, textAlign: 'right', fontWeight: '600' }}>
								{itemEarnings}₽
							</Text>
						</View>
					)
				})}
				<View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ color: colors.text, fontWeight: '600' }}>Итого зарплата:</Text>
					<Text style={{ color: colors.primary, fontWeight: 'bold' }}>
						{(() => {
							let totalEarnings = 0
							task.items.forEach(item => {
								const itemAddress = getAddressByServiceName(item.productName)
								const itemRate = getDeliveryRate(itemAddress)
								totalEarnings += itemRate * item.quantity
							})
							return totalEarnings
						})()}₽
					</Text>
				</View>
			</View>

			{/* Заметки менеджера */}
			{task.managerNotes && (
				<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
						<Feather name='message-square' size={18} color={colors.primary} />
						<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>Заметки менеджера</Text>
					</View>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{task.managerNotes}</Text>
				</View>
			)}

			{/* Действия курьера */}
			{isCourier && (
				<View style={{ gap: 12 }}>
					{task.status === 'pending' && (
						<Button onPress={handleStartDelivery} isLoading={isLoading} icon='truck'>
							Начать доставку
						</Button>
					)}

					{task.status === 'in_transit' && !showReportForm && (
						<>
							<Button onPress={() => setShowReportForm(true)} icon='check-circle'>
								Отчитаться о доставке
							</Button>
							<TouchableOpacity
								onPress={() => setShowReportForm(true)}
								style={{ backgroundColor: colors.error, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
							>
								<Feather name='x-circle' size={20} color='white' />
								<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Не удалось доставить</Text>
							</TouchableOpacity>
						</>
					)}

					{showReportForm && (
						<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
							<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Отчёт о доставке</Text>
							<TextInput
								style={{ backgroundColor: colors.border, color: colors.text, padding: 12, borderRadius: 8, marginBottom: 16 }}
								placeholder='Опишите результат доставки...'
								placeholderTextColor={colors.textSecondary}
								multiline
								numberOfLines={4}
								value={reportNotes}
								onChangeText={setReportNotes}
							/>
							<View style={{ flexDirection: 'row', gap: 12 }}>
								<TouchableOpacity
									onPress={handleSubmitReport}
									disabled={isLoading}
									style={{ flex: 1, backgroundColor: colors.success, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
								>
									<Feather name='check' size={18} color='white' />
									<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Доставлено</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={handleMarkFailed}
									disabled={isLoading}
									style={{ flex: 1, backgroundColor: colors.error, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
								>
									<Feather name='x' size={18} color='white' />
									<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Не доставлено</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity onPress={() => setShowReportForm(false)} style={{ marginTop: 8, padding: 8, alignItems: 'center' }}>
								<Text style={{ color: colors.textSecondary }}>Отмена</Text>
							</TouchableOpacity>
						</View>
					)}

					{task.status === 'delivered' && (
						<View style={{ backgroundColor: colors.success + '20', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.success + '30' }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
								<Feather name='check-circle' size={20} color={colors.success} />
								<Text style={{ color: colors.success, fontWeight: '600' }}>Доставка завершена</Text>
							</View>
							<Text style={{ color: colors.success, fontSize: 14 }}>
								{new Date(task.deliveredAt!).toLocaleString('ru-RU')}
							</Text>
							{task.notes && (
								<Text style={{ color: colors.success, fontSize: 14, marginTop: 8 }}>{task.notes}</Text>
							)}
						</View>
					)}

					{task.status === 'failed' && (
						<View style={{ backgroundColor: colors.error + '20', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.error + '30' }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
								<Feather name='x-circle' size={20} color={colors.error} />
								<Text style={{ color: colors.error, fontWeight: '600' }}>Доставка не удалась</Text>
							</View>
							{task.notes && (
								<Text style={{ color: colors.error, fontSize: 14, marginTop: 8 }}>{task.notes}</Text>
							)}
						</View>
					)}
				</View>
			)}
		</ScrollView>
	)
}