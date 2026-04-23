import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useDeliveries } from '@/hooks/useDeliveries'
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
	const [isLoading, setIsLoading] = useState(false)
	const [reportNotes, setReportNotes] = useState('')
	const [showReportForm, setShowReportForm] = useState(false)
	const [courierProfile, setCourierProfile] = useState<IUserProfile | null>(null)

	const isCourier = userProfile?.role === 'courier'

	// Загружаем данные курьера
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
		if (success) {
			onReportSubmitted?.()
		}
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
		if (success) {
			onReportSubmitted?.()
		}
	}

	const totalItems = task.items.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			{/* Заголовок */}
			<View className='flex-row items-center justify-between mb-4'>
				<Text className='text-white text-xl font-bold'>Задание {task.taskNumber}</Text>
				<View
					className='px-3 py-1 rounded-full'
					style={{ backgroundColor: getStatusColor(task.status) + '20' }}
				>
					<Text
						className='text-xs font-semibold'
						style={{ color: getStatusColor(task.status) }}
					>
						{getStatusLabel(task.status)}
					</Text>
				</View>
			</View>

			{/* Данные курьера */}
			<View className='bg-gray-default rounded-lg p-4 mb-4'>
				<View className='flex-row items-center mb-3'>
					<Feather name='user' size={20} color='#BF3335' />
					<Text className='text-white font-semibold ml-2'>Курьер</Text>
				</View>
				<Text className='text-gray-300 text-base font-semibold'>{task.courierName}</Text>
				{courierProfile?.phone && (
					<View className='flex-row items-center mt-2'>
						<Feather name='phone' size={16} color='#BF3335' />
						<Text className='text-gray-300 ml-2'>{courierProfile.phone}</Text>
					</View>
				)}
			</View>

			{/* Информация о доставке */}
			<View className='bg-gray-default rounded-lg p-4 mb-4'>
				<View className='flex-row items-center mb-3'>
					<Feather name='map-pin' size={20} color='#BF3335' />
					<Text className='text-white font-semibold ml-2'>Места доставки</Text>
				</View>
				{task.destinationAddresses && task.destinationAddresses.length > 1 ? (
					<View>
						{task.destinationAddresses.map((address, idx) => (
							<View key={idx} className='mb-2 pb-2 border-b border-gray-600 last:border-b-0 last:mb-0 last:pb-0'>
								<Text className='text-gray-300'>{address}</Text>
							</View>
						))}
					</View>
				) : (
					<>
						<Text className='text-gray-300 mb-2'>{task.destinationAddress}</Text>
						{task.customDestination && (
							<Text className='text-gray-400 text-sm'>{task.customDestination}</Text>
						)}
					</>
				)}
			</View>

			{/* Заказы/Товары */}
			<View className='bg-gray-default rounded-lg p-4 mb-4'>
				<View className='flex-row items-center mb-3'>
					<Feather name='package' size={20} color='#BF3335' />
					<Text className='text-white font-semibold ml-2'>
						Заказы ({totalItems} шт.)
					</Text>
				</View>
				{task.items.map((item, idx) => {
					const itemAddress = getAddressByServiceName(item.productName)
					const itemRate = getDeliveryRate(itemAddress)
					const itemEarnings = itemRate * item.quantity
					
					return (
						<View key={idx} className='flex-row justify-between items-center py-2 border-b border-gray-600 last:border-b-0'>
							<View className='flex-1'>
								<Text className='text-white text-sm'>{item.productName}</Text>
							</View>
							<Text className='text-gray-300 text-sm w-16 text-center'>{item.quantity} шт</Text>
							<Text className='text-primary text-sm w-20 text-right font-semibold'>
								{itemEarnings}₽
							</Text>
						</View>
					)
				})}
				<View className='mt-3 pt-3 border-t border-gray-600 flex-row justify-between'>
					<Text className='text-white font-semibold'>Итого зарплата:</Text>
					<Text className='text-primary font-bold'>
						{(() => {
							// Считаем зарплату: количество × тариф за каждый товар
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
				<View className='bg-gray-default rounded-lg p-4 mb-4'>
					<View className='flex-row items-center mb-2'>
						<Feather name='message-square' size={18} color='#BF3335' />
						<Text className='text-white font-semibold ml-2'>Заметки менеджера</Text>
					</View>
					<Text className='text-gray-300 text-sm'>{task.managerNotes}</Text>
				</View>
			)}

			{/* Действия курьера */}
			{isCourier && (
				<View className='gap-3'>
					{task.status === 'pending' && (
						<Button
							onPress={handleStartDelivery}
							isLoading={isLoading}
							icon='truck'
						>
							Начать доставку
						</Button>
					)}

					{task.status === 'in_transit' && !showReportForm && (
						<>
							<Button
								onPress={() => setShowReportForm(true)}
								icon='check-circle'
							>
								Отчитаться о доставке
							</Button>
							<TouchableOpacity
								onPress={() => setShowReportForm(true)}
								className='bg-red-600 p-3 rounded-lg flex-row items-center justify-center'
							>
								<Feather name='x-circle' size={20} color='white' />
								<Text className='text-white font-bold ml-2'>Не удалось доставить</Text>
							</TouchableOpacity>
						</>
					)}

					{showReportForm && (
						<View className='bg-gray-default rounded-lg p-4'>
							<Text className='text-white font-semibold mb-3'>Отчёт о доставке</Text>
							<TextInput
								className='bg-gray-600 text-white p-3 rounded-lg mb-4'
								placeholder='Опишите результат доставки...'
								placeholderTextColor='#999'
								multiline
								numberOfLines={4}
								value={reportNotes}
								onChangeText={setReportNotes}
							/>
							<View className='flex-row gap-3'>
								<TouchableOpacity
									onPress={handleSubmitReport}
									disabled={isLoading}
									className='flex-1 bg-green-600 p-3 rounded-lg flex-row items-center justify-center'
								>
									<Feather name='check' size={18} color='white' />
									<Text className='text-white font-bold ml-2'>Доставлено</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={handleMarkFailed}
									disabled={isLoading}
									className='flex-1 bg-red-600 p-3 rounded-lg flex-row items-center justify-center'
								>
									<Feather name='x' size={18} color='white' />
									<Text className='text-white font-bold ml-2'>Не доставлено</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								onPress={() => setShowReportForm(false)}
								className='mt-2 p-2 items-center'
							>
								<Text className='text-gray-400'>Отмена</Text>
							</TouchableOpacity>
						</View>
					)}

					{task.status === 'delivered' && (
						<View className='bg-green-600/20 rounded-lg p-4 border border-green-600/30'>
							<View className='flex-row items-center gap-2 mb-2'>
								<Feather name='check-circle' size={20} color='#10B981' />
								<Text className='text-green-400 font-semibold'>Доставка завершена</Text>
							</View>
							<Text className='text-green-300 text-sm'>
								{new Date(task.deliveredAt!).toLocaleString('ru-RU')}
							</Text>
							{task.notes && (
								<Text className='text-green-200 text-sm mt-2'>{task.notes}</Text>
							)}
						</View>
					)}

					{task.status === 'failed' && (
						<View className='bg-red-600/20 rounded-lg p-4 border border-red-600/30'>
							<View className='flex-row items-center gap-2 mb-2'>
								<Feather name='x-circle' size={20} color='#EF4444' />
								<Text className='text-red-400 font-semibold'>Доставка не удалась</Text>
							</View>
							{task.notes && (
								<Text className='text-red-200 text-sm mt-2'>{task.notes}</Text>
							)}
						</View>
					)}
				</View>
			)}
		</ScrollView>
	)
}