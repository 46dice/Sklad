import { useClients } from '@/components/Clients/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { useShipments } from '@/hooks/useShipments'
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

type FilterPeriod = 'today' | 'week' | 'month' | 'year'

const MonitoringScreen: FC<Props> = () => {
	const { user } = useAuth()
	const { clients } = useClients()
	const { shipments, fetchShipments } = useShipments()
	const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('month')

	// Обновляем мониторинг при возврате на вкладку
	useFocusEffect(
		useCallback(() => {
			fetchShipments()
		}, [fetchShipments])
	)

	// Фильтруем акты по периоду
	const getFilteredShipments = useCallback(() => {
		const now = new Date()
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		return shipments.filter(shipment => {
			const shipmentDate = new Date(shipment.createdAt)
			const shipmentDay = new Date(shipmentDate.getFullYear(), shipmentDate.getMonth(), shipmentDate.getDate())

			switch (filterPeriod) {
				case 'today':
					return shipmentDay.getTime() === today.getTime()
				case 'week':
					const weekAgo = new Date(today)
					weekAgo.setDate(weekAgo.getDate() - 7)
					return shipmentDay >= weekAgo && shipmentDay <= today
				case 'month':
					return shipmentDate.getMonth() === now.getMonth() && shipmentDate.getFullYear() === now.getFullYear()
				case 'year':
					return shipmentDate.getFullYear() === now.getFullYear()
				default:
					return true
			}
		})
	}, [shipments, filterPeriod])

	const filteredShipments = getFilteredShipments()

	// Получаем статистику
	const stats = useMemo(() => {
		const totalAmount = filteredShipments.reduce((sum, shipment) => sum + shipment.totalAmount, 0)
		const totalQuantity = filteredShipments.reduce((sum, shipment) => 
			sum + shipment.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
		)
		const totalShipments = filteredShipments.length

		return {
			totalAmount,
			totalQuantity,
			totalShipments
		}
	}, [filteredShipments])

	// Получаем данные для графика
	const getChartData = useCallback(() => {
		const now = new Date()
		const labels: string[] = []
		const data: number[] = []

		if (filterPeriod === 'today') {
			// По часам
			for (let i = 0; i < 24; i++) {
				labels.push(`${i}:00`)
				const hourShipments = filteredShipments.filter(s => {
					const date = new Date(s.createdAt)
					return date.getHours() === i
				})
				const amount = hourShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				data.push(amount)
			}
		} else if (filterPeriod === 'week') {
			// По дням недели
			const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
			for (let i = 0; i < 7; i++) {
				const date = new Date(now)
				date.setDate(date.getDate() - (6 - i))
				labels.push(daysOfWeek[date.getDay()])
				const dayShipments = filteredShipments.filter(s => {
					const sDate = new Date(s.createdAt)
					return sDate.toDateString() === date.toDateString()
				})
				const amount = dayShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				data.push(amount)
			}
		} else if (filterPeriod === 'month') {
			// По дням месяца
			const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
			for (let i = 1; i <= Math.min(daysInMonth, 30); i++) {
				labels.push(i.toString())
				const date = new Date(now.getFullYear(), now.getMonth(), i)
				const dayShipments = filteredShipments.filter(s => {
					const sDate = new Date(s.createdAt)
					return sDate.toDateString() === date.toDateString()
				})
				const amount = dayShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				data.push(amount)
			}
		} else {
			// По месяцам
			const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
			for (let i = 0; i < 12; i++) {
				labels.push(monthNames[i])
				const monthShipments = filteredShipments.filter(s => {
					const sDate = new Date(s.createdAt)
					return sDate.getMonth() === i && sDate.getFullYear() === now.getFullYear()
				})
				const amount = monthShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				data.push(amount)
			}
		}

		return {
			labels,
			datasets: [
				{
					data: data.length > 0 ? data : [0]
				}
			]
		}
	}, [filteredShipments, filterPeriod])

	const chartData = getChartData()
	const screenWidth = Dimensions.get('window').width
	const screenHeight = Dimensions.get('window').height
	const chartHeight = Math.floor(screenHeight * 0.5)

	const filterButtons = [
		{ label: 'Сегодня', value: 'today' as const },
		{ label: 'Неделя', value: 'week' as const },
		{ label: 'Месяц', value: 'month' as const },
		{ label: 'Год', value: 'year' as const }
	]

	return (
		<View className='flex-1'>
			{/* Header */}
			<View className='flex-row items-center justify-between px-4 pt-4 pb-2'>
				<Text className='text-white text-2xl font-bold'>Мониторинг</Text>
			</View>

			{/* Scrollable content */}
			<ScrollView className='flex-1' contentContainerStyle={{ padding: 16 }}>
				<View className='gap-4'>
					{/* График выручки */}
					<View className='bg-gray-default rounded-lg p-4 overflow-hidden'>
						<Text className='text-white text-lg font-semibold mb-4'>
							Выручка из актов
						</Text>
						<LineChart
							data={chartData}
							width={screenWidth - 40}
							height={chartHeight}
							chartConfig={{
								backgroundColor: '#282828',
								backgroundGradientFrom: '#282828',
								backgroundGradientTo: '#282828',
								decimalPlaces: 0,
								color: () => '#BF3335',
								labelColor: () => '#FFFAFA',
								formatYLabel: value => {
									const num = Math.round(Number(value))
									if (num >= 1000) {
										return (num / 1000).toFixed(0)
									}
									return `${num.toString() + 'руб'}`
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
							bezier
						/>
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
									className={`flex-1 py-2 px-3 rounded-lg ${
										filterPeriod === btn.value
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
								<Feather name='file-text' size={20} color='#BF3335' />
								<Text className='text-white text-sm font-semibold ml-2'>
									Актов
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalShipments}
							</Text>
						</View>

						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Feather name='shopping-cart' size={20} color='#BF3335' />
								<Text className='text-white text-sm font-semibold ml-2'>
									Услуг
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalQuantity}
							</Text>
						</View>

						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Text className='text-white text-sm font-semibold ml-2'>
									Выручка (руб.)
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalAmount.toFixed(0)}
							</Text>
						</View>
					</View>

					{/* Статистика */}
					<View className='bg-gray-default rounded-lg p-4'>
						<View className='flex-row items-center mb-2'>
							<Feather name='users' size={24} color='#BF3335' />
							<Text className='text-white text-lg font-semibold ml-3'>
								Всего контрагентов
							</Text>
						</View>
						<Text className='text-4xl font-bold text-primary'>
							{clients.length}
						</Text>
					</View>

					<View className='bg-gray-default rounded-lg p-4'>
						<View className='flex-row items-center mb-2'>
							<Feather name='log-in' size={24} color='#BF3335' />
							<Text className='text-white text-lg font-semibold ml-3'>
								Аккаунт
							</Text>
						</View>
						<Text className='text-gray-500 text-sm'>{user?.email}</Text>
					</View>

					<View className='bg-gray-default rounded-lg p-4'>
						<View className='flex-row items-center mb-2'>
							<Feather name='activity' size={24} color='#BF3335' />
							<Text className='text-white text-lg font-semibold ml-3'>
								Жизненный цикл
							</Text>
						</View>
						<Text className='text-green-500 text-sm'>Статус: Активно</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default MonitoringScreen
