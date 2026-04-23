import { useCourierPayments } from '@/hooks/useCourierPayments'
import { ICourierPayment } from '@/shared/types/courier.types'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

type Props = Record<string, never>

const CourierPaymentHistory: FC<Props> = () => {
	const { payments, isLoading } = useCourierPayments()
	const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)

	// Группируем платежи по курьерам
	const paymentsByCourier = payments.reduce((acc, payment) => {
		if (!acc[payment.courierId]) {
			acc[payment.courierId] = []
		}
		acc[payment.courierId].push(payment)
		return acc
	}, {} as Record<string, ICourierPayment[]>)

	const handleToggleExpand = (paymentId: string) => {
		setExpandedPaymentId(expandedPaymentId === paymentId ? null : paymentId)
	}

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			{isLoading ? (
				<View className='items-center justify-center py-12'>
					<ActivityIndicator size='large' color='#BF3335' />
					<Text className='text-gray-400 mt-4'>Загрузка...</Text>
				</View>
			) : Object.keys(paymentsByCourier).length > 0 ? (
				Object.entries(paymentsByCourier).map(([courierId, courierPayments]) => {
					const totalEarnings = courierPayments.reduce((sum, p) => sum + p.totalEarnings, 0)
					const totalDeliveries = courierPayments.reduce((sum, p) => sum + p.completedDeliveries, 0)

					return (
						<View key={courierId} className='mb-4 border border-gray-600 rounded-lg overflow-hidden'>
							{/* Заголовок курьера */}
							<View className='bg-gray-default p-4 border-b border-gray-600'>
								<View className='flex-row items-center justify-between'>
									<View className='flex-1'>
										<Text className='text-white font-bold text-lg'>{courierPayments[0].courierName}</Text>
										<Text className='text-gray-400 text-sm mt-1'>
											Всего доставок: {totalDeliveries} | Заработано: {totalEarnings}₽
										</Text>
									</View>
									<View className='items-center'>
										<Text className='text-primary font-bold text-xl'>{totalEarnings}₽</Text>
									</View>
								</View>
							</View>

							{/* Расчёты по периодам */}
							{courierPayments.map((payment, idx) => {
								const isExpanded = expandedPaymentId === `${courierId}-${idx}`
								return (
									<TouchableOpacity
										key={idx}
										onPress={() => handleToggleExpand(`${courierId}-${idx}`)}
										className={`bg-gray-default p-3 ${idx < courierPayments.length - 1 ? 'border-b border-gray-600' : ''}`}
									>
										<View className='flex-row items-center justify-between'>
											<View className='flex-1'>
												<Text className='text-gray-300 text-sm'>
													{payment.periodFrom} - {payment.periodTo}
												</Text>
												<View className='flex-row gap-3 mt-1'>
													<Text className='text-gray-400 text-xs'>
														✓ {payment.completedDeliveries}
													</Text>
													<Text className='text-gray-400 text-xs'>
														✗ {payment.failedDeliveries}
													</Text>
												</View>
											</View>
											<View className='items-end'>
												<Text className='text-primary font-bold'>{payment.totalEarnings}₽</Text>
												<Feather
													name={isExpanded ? 'chevron-up' : 'chevron-down'}
													size={16}
													color='#666'
													style={{ marginTop: 4 }}
												/>
											</View>
										</View>

										{/* Развёрнутые детали */}
										{isExpanded && (
											<View className='mt-3 pt-3 border-t border-gray-600'>
												{payment.deliveries.filter(d => d.status === 'delivered').map((delivery, dIdx) => (
													<View
														key={dIdx}
														className='flex-row justify-between items-center py-2 border-b border-gray-700 last:border-b-0'
													>
														<View className='flex-1'>
															<Text className='text-gray-300 text-sm'>{delivery.taskNumber}</Text>
															<Text className='text-gray-500 text-xs'>{delivery.destination}</Text>
														</View>
														<Text className='text-primary font-bold w-16 text-right'>
															{delivery.rate}₽
														</Text>
													</View>
												))}
												
											</View>
										)}
									</TouchableOpacity>
								)
							})}
						</View>
					)
				})
			) : (
				<View className='items-center justify-center py-12'>
					<Feather name='inbox' size={48} color='#666' />
					<Text className='text-gray-500 mt-4'>Нет расчётов</Text>
				</View>
			)}
		</ScrollView>
	)
}

export default CourierPaymentHistory
