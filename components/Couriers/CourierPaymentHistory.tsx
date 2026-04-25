import { useCourierPayments } from '@/hooks/useCourierPayments'
import { useTheme } from '@/providers/theme/ThemeProvider'
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
	const { colors } = useTheme()
	const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)

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
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			{isLoading ? (
				<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
					<ActivityIndicator size='large' color={colors.primary} />
					<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Загрузка...</Text>
				</View>
			) : Object.keys(paymentsByCourier).length > 0 ? (
				Object.entries(paymentsByCourier).map(([courierId, courierPayments]) => {
					const totalEarnings = courierPayments.reduce((sum, p) => sum + p.totalEarnings, 0)
					const totalDeliveries = courierPayments.reduce((sum, p) => sum + p.completedDeliveries, 0)

					return (
						<View key={courierId} style={{ marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
							{/* Заголовок курьера */}
							<View style={{ backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<View style={{ flex: 1 }}>
										<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{courierPayments[0].courierName}</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
											Всего доставок: {totalDeliveries} | Заработано: {totalEarnings}₽
										</Text>
									</View>
									<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 20 }}>{totalEarnings}₽</Text>
								</View>
							</View>

							{/* Расчёты по периодам */}
							{courierPayments.map((payment, idx) => {
								const isExpanded = expandedPaymentId === `${courierId}-${idx}`
								return (
									<TouchableOpacity
										key={idx}
										onPress={() => handleToggleExpand(`${courierId}-${idx}`)}
										style={{
											backgroundColor: colors.surface,
											padding: 12,
											borderBottomWidth: idx < courierPayments.length - 1 ? 1 : 0,
											borderBottomColor: colors.border
										}}
									>
										<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
											<View style={{ flex: 1 }}>
												<Text style={{ color: colors.text, fontSize: 14 }}>
													{payment.periodFrom} - {payment.periodTo}
												</Text>
												<View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
													<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
														✓ {payment.completedDeliveries}
													</Text>
													{payment.failedDeliveries > 0 && (
														<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
															Не доставлено: {payment.failedDeliveries} шт. (не оплачиваются)
														</Text>
													)}
												</View>
											</View>
											<View style={{ alignItems: 'flex-end' }}>
												<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{payment.totalEarnings}₽</Text>
												<Feather
													name={isExpanded ? 'chevron-up' : 'chevron-down'}
													size={16}
													color={colors.textSecondary}
													style={{ marginTop: 4 }}
												/>
											</View>
										</View>

										{isExpanded && (
											<View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
												{payment.deliveries.filter(d => d.status === 'delivered').map((delivery, dIdx) => (
													<View
														key={dIdx}
														style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}
													>
														<View style={{ flex: 1 }}>
															<Text style={{ color: colors.text, fontSize: 14 }}>{delivery.taskNumber}</Text>
															<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{delivery.destination}</Text>
														</View>
														<Text style={{ color: colors.primary, fontWeight: 'bold', width: 64, textAlign: 'right' }}>
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
				<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
					<Feather name='inbox' size={48} color={colors.textSecondary} />
					<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Нет расчётов</Text>
				</View>
			)}
		</ScrollView>
	)
}

export default CourierPaymentHistory
