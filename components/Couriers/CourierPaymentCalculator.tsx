import { useCourierPayments } from '@/hooks/useCourierPayments'
import { useCouriers } from '@/hooks/useCouriers'
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

		// Сохраняем периоды
		onPeriodsChange?.(periodFrom, periodTo)

		const courier = couriers.find(c => c.id === selectedCourier)
		if (!courier) return

		const payment = await calculateCourierPayment(
			selectedCourier,
			courier.name,
			periodFrom,
			periodTo
		)

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
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			<Text className='text-white text-2xl font-bold mb-6'>Расчёт  курьеров</Text>

			{/* Выбор курьера */}
			<View className='mb-4'>
				<Text className='text-gray-300 text-sm font-medium mb-2'>Курьер *</Text>
				<View className='bg-gray-default rounded-lg overflow-hidden'>
					{couriers.map(courier => (
						<TouchableOpacity
							key={courier.id}
							onPress={() => setSelectedCourier(courier.id)}
							className={`p-3 border-b border-gray-600 flex-row items-center justify-between ${
								selectedCourier === courier.id ? 'bg-primary/20' : ''
							}`}
						>
							<Text className={`text-base ${selectedCourier === courier.id ? 'text-primary font-semibold' : 'text-white'}`}>
								{courier.name}
							</Text>
							{selectedCourier === courier.id && (
								<Feather name='check' size={20} color='#BF3335' />
							)}
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Период */}
			<View className='mb-6'>
				<Text className='text-gray-300 text-sm font-medium mb-2'>Период</Text>
				<View className='flex-row gap-2'>
					<View className='flex-1'>
						<Text className='text-gray-400 text-xs mb-1'>От</Text>
						<TextInput
							className='bg-gray-default text-white p-3 rounded-lg'
							placeholder='YYYY-MM-DD'
							placeholderTextColor='#666'
							value={periodFrom}
							onChangeText={setPeriodFrom}
						/>
					</View>
					<View className='flex-1'>
						<Text className='text-gray-400 text-xs mb-1'>До</Text>
						<TextInput
							className='bg-gray-default text-white p-3 rounded-lg'
							placeholder='YYYY-MM-DD'
							placeholderTextColor='#666'
							value={periodTo}
							onChangeText={setPeriodTo}
						/>
					</View>
				</View>
			</View>

			{/* Кнопка расчёта */}
			<Button
				onPress={handleCalculate}
				isLoading={isLoading}
				disabled={!selectedCourier || isLoading}
				className=''
			>
				Рассчитать зарплату
			</Button>

			{/* Результаты расчёта */}
			{showCalculation && calculatedPayment && (
				<View className='mt-6 bg-gray-default rounded-lg p-4'>
					<View className='flex-row items-center justify-between mb-4'>
						<Text className='text-white text-lg font-bold'>Результат расчёта</Text>
						<TouchableOpacity onPress={() => setShowCalculation(false)}>
							<Feather name='x' size={20} color='#666' />
						</TouchableOpacity>
					</View>

					{/* Информация о курьере */}
					<View className='mb-4 pb-4 border-b border-gray-600'>
						<Text className='text-gray-300 text-sm'>Курьер: <Text className='text-white font-semibold'>{calculatedPayment.courierName}</Text></Text>
						<Text className='text-gray-300 text-sm mt-1'>Период: <Text className='text-white font-semibold'>{calculatedPayment.periodFrom} - {calculatedPayment.periodTo}</Text></Text>
					</View>

					{/* Статистика */}
					<View className='mb-4 pb-4 border-b border-gray-600'>
						<View className='flex-row justify-between mb-2'>
							<Text className='text-gray-300 text-sm'>Всего доставок:</Text>
							<Text className='text-white font-semibold'>{calculatedPayment.totalDeliveries}</Text>
						</View>
						<View className='flex-row justify-between mb-2'>
							<Text className='text-gray-300 text-sm'>Успешных:</Text>
							<Text className='text-green-400 font-semibold'>{calculatedPayment.completedDeliveries}</Text>
						</View>
						<View className='flex-row justify-between'>
							<Text className='text-gray-300 text-sm'>Неудачных:</Text>
							<Text className='text-red-400 font-semibold'>{calculatedPayment.failedDeliveries}</Text>
						</View>
					</View>

					{/* Детали доставок */}
					<View className='mb-4 pb-4 border-b border-gray-600'>
						<Text className='text-white font-semibold mb-2'>Доставки:</Text>
						{calculatedPayment.deliveries.map((delivery, idx) => (
							<View key={idx} className='flex-row justify-between items-center py-2 border-b border-gray-700 last:border-b-0'>
								<View className='flex-1'>
									<Text className='text-gray-300 text-sm'>{delivery.taskNumber}</Text>
									<Text className='text-gray-500 text-xs'>{delivery.destination}</Text>
								</View>
								<View className='flex-row items-center gap-2'>
									<Text className={`text-sm font-semibold ${delivery.status === 'delivered' ? 'text-green-400' : 'text-red-400'}`}>
										{delivery.status === 'delivered' ? '✓' : '✗'}
									</Text>
									<Text className='text-primary font-bold w-12 text-right'>{delivery.rate}₽</Text>
								</View>
							</View>
						))}
					</View>

					{/* Итого */}
					<View className='bg-primary/20 rounded-lg p-3 mb-4 border border-primary/30'>
						<View className='flex-row justify-between items-center'>
							<Text className='text-white font-bold text-lg'>Итого к выплате:</Text>
							<Text className='text-primary font-bold text-2xl'>{calculatedPayment.totalEarnings}₽</Text>
						</View>
					</View>

					{/* Кнопка сохранения */}
					<Button
						onPress={handleSavePayment}
						isLoading={isLoading}
					>
						Сохранить расчёт
					</Button>
				</View>
			)}
		</ScrollView>
	)
}

export default CourierPaymentCalculator
