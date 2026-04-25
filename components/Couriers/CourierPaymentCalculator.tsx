import { useCourierPayments } from '@/hooks/useCourierPayments'
import { useCouriers } from '@/hooks/useCouriers'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { ICourierPayment } from '@/shared/types/courier.types'
import { Button } from '@/shared/ui/Button'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

type Props = {
	onClose?: () => void
	initialPeriodFrom?: string
	initialPeriodTo?: string
	onPeriodsChange?: (from: string, to: string) => void
}

const CourierPaymentCalculator: FC<Props> = ({ onClose, initialPeriodFrom, initialPeriodTo, onPeriodsChange }) => {
	const { couriers } = useCouriers()
	const { calculateCourierPayment, savePaymentCalculation, isLoading } = useCourierPayments()
	const { colors } = useTheme()
	const [selectedCourier, setSelectedCourier] = useState<string>('')
	const [periodFrom, setPeriodFrom] = useState<string>(
		initialPeriodFrom || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
	)
	const [periodTo, setPeriodTo] = useState<string>(
		initialPeriodTo || new Date().toISOString().split('T')[0]
	)
	const [calculatedPayment, setCalculatedPayment] = useState<ICourierPayment | null>(null)
	const [showCalculation, setShowCalculation] = useState(false)

	const handleCalculate = async () => {
		if (!selectedCourier) {
			alert('Выберите курьера')
			return
		}
		onPeriodsChange?.(periodFrom, periodTo)
		const courier = couriers.find(c => c.id === selectedCourier)
		if (!courier) return
		const payment = await calculateCourierPayment(selectedCourier, courier.name, periodFrom, periodTo)
		if (payment) {
			setCalculatedPayment(payment)
			setShowCalculation(true)
		}
	}

	const handleSavePayment = async () => {
		if (!calculatedPayment) return
		const success = await savePaymentCalculation(calculatedPayment)
		if (success) {
			setCalculatedPayment(null)
			setShowCalculation(false)
			onClose?.()
		}
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Расчёт курьеров</Text>

			{/* Выбор курьера */}
			<View style={{ marginBottom: 16 }}>
				<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Курьер *</Text>
				<View style={{ backgroundColor: colors.surface, borderRadius: 8, overflow: 'hidden' }}>
					{couriers.map(courier => (
						<TouchableOpacity
							key={courier.id}
							onPress={() => setSelectedCourier(courier.id)}
							style={{
								padding: 12,
								borderBottomWidth: 1,
								borderBottomColor: colors.border,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								backgroundColor: selectedCourier === courier.id ? colors.primary + '20' : 'transparent'
							}}
						>
							<Text style={{ fontSize: 16, color: selectedCourier === courier.id ? colors.primary : colors.text, fontWeight: selectedCourier === courier.id ? '600' : 'normal' }}>
								{courier.name}
							</Text>
							{selectedCourier === courier.id && (
								<Feather name='check' size={20} color={colors.primary} />
							)}
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Период */}
			<View style={{ marginBottom: 24 }}>
				<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Период</Text>
				<View style={{ flexDirection: 'row', gap: 8 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>От</Text>
						<TextInput
							style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
							placeholder='YYYY-MM-DD'
							placeholderTextColor={colors.textSecondary}
							value={periodFrom}
							onChangeText={setPeriodFrom}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>До</Text>
						<TextInput
							style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
							placeholder='YYYY-MM-DD'
							placeholderTextColor={colors.textSecondary}
							value={periodTo}
							onChangeText={setPeriodTo}
						/>
					</View>
				</View>
			</View>

			<Button onPress={handleCalculate} isLoading={isLoading} disabled={!selectedCourier || isLoading}>
				Рассчитать зарплату
			</Button>

			{/* Результаты */}
			{showCalculation && calculatedPayment && (
				<View style={{ marginTop: 24, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
						<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Результат расчёта</Text>
						<TouchableOpacity onPress={() => setShowCalculation(false)}>
							<Feather name='x' size={20} color={colors.textSecondary} />
						</TouchableOpacity>
					</View>

					<View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Курьер: <Text style={{ color: colors.text, fontWeight: '600' }}>{calculatedPayment.courierName}</Text></Text>
						<Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Период: <Text style={{ color: colors.text, fontWeight: '600' }}>{calculatedPayment.periodFrom} - {calculatedPayment.periodTo}</Text></Text>
					</View>

					<View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Всего доставок:</Text>
							<Text style={{ color: colors.text, fontWeight: '600' }}>{calculatedPayment.totalDeliveries}</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Успешных:</Text>
							<Text style={{ color: colors.success, fontWeight: '600' }}>{calculatedPayment.completedDeliveries}</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Неудачных:</Text>
							<Text style={{ color: colors.error, fontWeight: '600' }}>{calculatedPayment.failedDeliveries}</Text>
						</View>
					</View>

					<View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Доставки:</Text>
						{calculatedPayment.deliveries.map((delivery, idx) => (
							<View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<View style={{ flex: 1 }}>
									<Text style={{ color: colors.text, fontSize: 14 }}>{delivery.taskNumber}</Text>
									<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{delivery.destination}</Text>
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
									<Text style={{ fontSize: 14, fontWeight: '600', color: delivery.status === 'delivered' ? colors.success : colors.error }}>
										{delivery.status === 'delivered' ? '✓' : '✗'}
									</Text>
									<Text style={{ color: colors.primary, fontWeight: 'bold', width: 48, textAlign: 'right' }}>{delivery.rate}₽</Text>
								</View>
							</View>
						))}
					</View>

					<View style={{ backgroundColor: colors.primary + '20', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + '30' }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Итого к выплате:</Text>
							<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 24 }}>{calculatedPayment.totalEarnings}₽</Text>
						</View>
					</View>

					<Button onPress={handleSavePayment} isLoading={isLoading}>
						Сохранить расчёт
					</Button>
				</View>
			)}
		</ScrollView>
	)
}

export default CourierPaymentCalculator
