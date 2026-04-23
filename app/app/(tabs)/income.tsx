import { useAuth } from '@/hooks/useAuth'
import { useDeliveries } from '@/hooks/useDeliveries'
import { getDeliveryRate } from '@/shared/types/courier.types'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback, useMemo, useState } from 'react'
import {
	Dimensions,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'

type Props = Record<string, never>

type FilterPeriod = 'week' | 'month' | 'year'

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

// Функция для расчёта зарплаты курьера за доставку
const calculateCourierEarnings = (delivery: any): number => {
	let totalEarnings = 0
	
	delivery.items.forEach((item: any) => {
		const itemAddress = getAddressByServiceName(item.productName)
		const rate = getDeliveryRate(itemAddress)
		// Зарплата = тариф × количество товаров
		totalEarnings += rate * item.quantity
	})
	
	return totalEarnings
}

const IncomeScreen: FC<Props> = () => {
	const { user } = useAuth()
	const { deliveries, fetchDeliveries } = useDeliveries()
	const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')

	useFocusEffect(
		useCallback(() => {
			fetchDeliveries()
		}, [fetchDeliveries])
	)

	// Фильтруем доставки текущего курьера со статусом "delivered"
	const courierDeliveries = useMemo(() => {
		if (!user) return []
		return deliveries.filter(d => d.courierId === user.uid && d.status === 'delivered')
	}, [deliveries, user])

	// Фильтруем по периоду
	const getFilteredDeliveries = useCallback(() => {
		const now = new Date()
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		return courierDeliveries.filter(delivery => {
			const deliveryDate = new Date(delivery.deliveredAt || delivery.createdAt)
			const deliveryDay = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate())

			switch (filterPeriod) {
				case 'week':
					const weekAgo = new Date(today)
					weekAgo.setDate(weekAgo.getDate() - 7)
					return deliveryDay >= weekAgo && deliveryDay <= today
				case 'month':
					return deliveryDate.getMonth() === now.getMonth() && deliveryDate.getFullYear() === now.getFullYear()
				case 'year':
					return deliveryDate.getFullYear() === now.getFullYear()
				default:
					return true
			}
		})
	}, [courierDeliveries, filterPeriod])

	const filteredDeliveries = getFilteredDeliveries()

	// Получаем статистику
	const stats = useMemo(() => {
		const totalIncome = filteredDeliveries.reduce((sum, delivery) => sum + calculateCourierEarnings(delivery), 0)
		const totalDeliveries = filteredDeliveries.length

		return {
			totalIncome,
			totalDeliveries
		}
	}, [filteredDeliveries])

	// Получаем данные для графика
	const chartDataWithMax = useMemo(() => {
		const now = new Date()
		const labels: string[] = []
		const data: number[] = []

		if (filterPeriod === 'week') {
			// Последние 7 дней
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			for (let i = 6; i >= 0; i--) {
				const date = new Date(today)
				date.setDate(today.getDate() - i)
				labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }))
				const dayDeliveries = filteredDeliveries.filter(d => {
					const dDate = new Date(d.deliveredAt || d.createdAt)
					return dDate.toDateString() === date.toDateString()
				})
				const amount = dayDeliveries.reduce((sum, d) => sum + calculateCourierEarnings(d), 0)
				data.push(amount)
			}
		} else if (filterPeriod === 'month') {
			// 5 недель
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			const weekLabels: string[] = []
			const weekData: number[] = []
			
			for (let week = 4; week >= 0; week--) {
				const weekEnd = new Date(today)
				weekEnd.setDate(today.getDate() - week * 7)
				weekEnd.setHours(23, 59, 59, 999)
				
				const weekStart = new Date(weekEnd)
				weekStart.setDate(weekStart.getDate() - 6)
				weekStart.setHours(0, 0, 0, 0)
				
				weekLabels.push(weekEnd.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }))
				
				const weekDeliveries = filteredDeliveries.filter(d => {
					const dDate = new Date(d.deliveredAt || d.createdAt)
					return dDate >= weekStart && dDate <= weekEnd
				})
				const amount = weekDeliveries.reduce((sum, d) => sum + calculateCourierEarnings(d), 0)
				weekData.push(amount)
			}
			labels.push(...weekLabels)
			data.push(...weekData)
		} else { // year
			// 12 месяцев с шагом в 2 месяца
			const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
			for (let i = 11; i >= 0; i -= 2) {
				const date = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
				labels.push(monthNames[date.getMonth()].substring(0, 3))
				
				let amount = 0
				for (let m = 0; m < 2; m++) {
					const monthDate = new Date(now.getFullYear(), now.getMonth() - i + m, 1)
					const monthDeliveries = filteredDeliveries.filter(d => {
						const dDate = new Date(d.deliveredAt || d.createdAt)
						return dDate.getMonth() === monthDate.getMonth() && dDate.getFullYear() === monthDate.getFullYear()
					})
					amount += monthDeliveries.reduce((sum, d) => sum + calculateCourierEarnings(d), 0)
				}
				data.push(amount)
			}
		}

		const maxValue = Math.max(...data, 1)
		return {
			labels,
			datasets: [{ data }],
			maxValue
		}
	}, [filteredDeliveries, filterPeriod])

	const chartData = chartDataWithMax
	const screenWidth = Dimensions.get('window').width
	const screenHeight = Dimensions.get('window').height
	const chartHeight = Math.floor(screenHeight * 0.5)

	const minChartWidth = screenWidth - 40
	const pointWidth = filterPeriod === 'week' ? 40 : filterPeriod === 'month' ? 50 : 35
	const chartWidth = Math.max(minChartWidth, chartData.labels.length * pointWidth)

	const yAxisMax = Math.ceil(chartData.maxValue / 1000) * 1000 || 1000

	const filterButtons = [
		{ label: 'Неделя', value: 'week' as const },
		{ label: 'Месяц', value: 'month' as const },
		{ label: 'Год', value: 'year' as const }
	]

	return (
		<View className='flex-1'>
			{/* Header */}
			<View className='flex-row items-center justify-between px-4 pt-4 pb-2'>
				<Text className='text-white text-2xl font-bold'>Мой доход</Text>
			</View>

			{/* Scrollable content */}
			<ScrollView className='flex-1' contentContainerStyle={{ padding: 16 }}>
				<View className='gap-4'>
					{/* График дохода */}
					<View className='bg-gray-default rounded-lg p-4 overflow-hidden'>
						<Text className='text-white text-lg font-semibold mb-4'>
							Доход от доставок
						</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={true}>
							<LineChart
								data={{
									labels: chartData.labels,
									datasets: chartData.datasets,
									legend: []
								}}
								width={chartWidth}
								height={chartHeight}
								yAxisInterval={yAxisMax / 4}
								yAxisSuffix=""
								chartConfig={{
									backgroundColor: '#282828',
									backgroundGradientFrom: '#282828',
									backgroundGradientTo: '#282828',
									decimalPlaces: 0,
									color: () => '#BF3335',
									labelColor: () => '#FFFAFA',
									formatYLabel: value => {
										const num = Math.round(Number(value))
										if (num === 0) return '0'
										if (num >= 1000) {
											return (num / 1000).toFixed(0) + 'к'
										}
										return num.toString()
									},
									style: {
										borderRadius: 8
									},
									propsForDots: {
										r: '5',
										strokeWidth: '2',
										stroke: '#BF3335'
									},
									propsForBackgroundLines: {
										strokeDasharray: '0'
									}
								}}
								style={{
									borderRadius: 8,
									marginLeft: -20
								}}
								segments={4}
								bezier
							/>
						</ScrollView>
					</View>

					{/* Фильтры графика */}
					<View>
						<Text className='text-gray-500 text-xs font-semibold mb-2'>
							ПЕРИОД
						</Text>
						<View className='flex-row gap-2 mb-3'>
							{filterButtons.map(btn => (
								<Pressable
									key={btn.value}
									onPress={() => setFilterPeriod(btn.value)}
									className={`flex-1 py-2 px-3 rounded-lg ${filterPeriod === btn.value
										? 'bg-primary'
										: 'bg-gray-default'
										}`}
								>
									<Text className='text-white text-center font-semibold text-xs'>
										{btn.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					{/* Статистика */}
					<View className='flex-row gap-3'>
						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Feather name='truck' size={20} color='#BF3335' />
								<Text className='text-white text-sm font-semibold ml-2'>
									Доставок
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalDeliveries}
							</Text>
						</View>

						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Text className='text-white text-sm font-semibold ml-2'>
									Доход (руб.)
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalIncome.toFixed(0)}
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default IncomeScreen
