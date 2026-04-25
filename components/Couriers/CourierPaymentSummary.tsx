import { useCourierPayments } from '@/hooks/useCourierPayments'
import { useCouriers } from '@/hooks/useCouriers'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	Text,
	View
} from 'react-native'

type Props = Record<string, never>

const CourierPaymentSummary: FC<Props> = () => {
	const { couriers } = useCouriers()
	const { payments, isLoading, getCourierSummary } = useCourierPayments()
	const { colors } = useTheme()

	const totalAllEarnings = payments.reduce((sum, p) => sum + p.totalEarnings, 0)
	const totalAllDeliveries = payments.reduce((sum, p) => sum + p.completedDeliveries, 0)

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Сводка по зарплатам</Text>

			{isLoading ? (
				<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
					<ActivityIndicator size='large' color={colors.primary} />
					<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Загрузка...</Text>
				</View>
			) : (
				<>
					{/* Общая статистика */}
					<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
							<View>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Всего выплачено</Text>
								<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 24, marginTop: 4 }}>{totalAllEarnings}₽</Text>
							</View>
							<View>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Доставок выполнено</Text>
								<Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 24, marginTop: 4 }}>{totalAllDeliveries}</Text>
							</View>
						</View>
					</View>

					{/* По курьерам */}
					<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>По курьерам</Text>
					{couriers.length > 0 ? (
						couriers.map(courier => {
							const summary = getCourierSummary(courier.id)
							return (
								<View key={courier.id} style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 12 }}>
									<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
										<View style={{ flex: 1 }}>
											<Text style={{ color: colors.text, fontWeight: '600' }}>{courier.name}</Text>
											<Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
												Доставок: {summary?.completedDeliveries || 0}
											</Text>
										</View>
										<View style={{ alignItems: 'flex-end' }}>
											<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
												{summary?.totalEarnings || 0}₽
											</Text>
											{summary && summary.failedDeliveries > 0 && (
												<Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
													Не доставлено: {summary.failedDeliveries}
												</Text>
											)}
										</View>
									</View>
									{!summary && (
										<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Нет расчётов</Text>
									)}
								</View>
							)
						})
					) : (
						<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
							<Feather name='users' size={48} color={colors.textSecondary} />
							<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Нет курьеров</Text>
						</View>
					)}
				</>
			)}
		</ScrollView>
	)
}

export default CourierPaymentSummary
