import { useClients } from '@/components/Clients/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
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

const MonitoringScreen: FC<Props> = () => {
	const { user } = useAuth()
	const { clients } = useClients()
	const { shipments, fetchShipments } = useShipments()
	const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')
	const { colors } = useTheme()

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
	const chartDataWithMax = useMemo(() => {
		const now = new Date()
		const labels: string[] = []
		const data: number[] = []

		if (filterPeriod === 'week') {
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			for (let i = 6; i >= 0; i--) {
				const date = new Date(today)
				date.setDate(today.getDate() - i)
				labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }))
				const dayShipments = filteredShipments.filter(s => {
					const sDate = new Date(s.createdAt)
					return sDate.toDateString() === date.toDateString()
				})
				const amount = dayShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				data.push(amount)
			}
		} else if (filterPeriod === 'month') {
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
				
				const weekShipments = filteredShipments.filter(s => {
					const sDate = new Date(s.createdAt)
					return sDate >= weekStart && sDate <= weekEnd
				})
				const amount = weekShipments.reduce((sum, s) => sum + s.totalAmount, 0)
				weekData.push(amount)
			}
			labels.push(...weekLabels)
			data.push(...weekData)
		} else {
			const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
			for (let i = 11; i >= 0; i -= 2) {
				const date = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
				labels.push(monthNames[date.getMonth()].substring(0, 3))
				
				let amount = 0
				for (let m = 0; m < 2; m++) {
					const monthDate = new Date(now.getFullYear(), now.getMonth() - i + m, 1)
					const monthShipments = filteredShipments.filter(s => {
						const sDate = new Date(s.createdAt)
						return sDate.getMonth() === monthDate.getMonth() && sDate.getFullYear() === monthDate.getFullYear()
					})
					amount += monthShipments.reduce((sum, s) => sum + s.totalAmount, 0)
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
	}, [filteredShipments, filterPeriod])

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
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>Мониторинг</Text>
			</View>

			{/* Scrollable content */}
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
				<View style={{ gap: 16 }}>
					{/* График выручки */}
					<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, overflow: 'hidden' }}>
						<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
							Выручка из актов
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
									backgroundColor: colors.surface,
									backgroundGradientFrom: colors.surface,
									backgroundGradientTo: colors.surface,
									decimalPlaces: 0,
									color: () => colors.primary,
									labelColor: () => colors.text,
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
										stroke: colors.primary
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
						<Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
							ПЕРИОД
						</Text>
						<View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
							{filterButtons.map(btn => (
								<Pressable
									key={btn.value}
									onPress={() => setFilterPeriod(btn.value)}
									style={{
										flex: 1,
										paddingVertical: 8,
										paddingHorizontal: 12,
										borderRadius: 8,
										backgroundColor: filterPeriod === btn.value ? colors.primary : colors.surface
									}}
								>
									<Text style={{ color: colors.text === '#1A1A1A' && filterPeriod !== btn.value ? colors.text : '#FFFFFF', textAlign: 'center', fontWeight: '600', fontSize: 12 }}>
										{btn.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					{/* Статистика */}
					<View style={{ flexDirection: 'row', gap: 12 }}>
						<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
								<Feather name='file-text' size={20} color={colors.primary} />
								<Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
									Актов
								</Text>
							</View>
							<Text style={{ color: colors.primary, fontSize: 30, fontWeight: 'bold' }}>
								{stats.totalShipments}
							</Text>
						</View>

						<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
								<Feather name='shopping-cart' size={20} color={colors.primary} />
								<Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
									Услуг
								</Text>
							</View>
							<Text style={{ color: colors.primary, fontSize: 30, fontWeight: 'bold' }}>
								{stats.totalQuantity}
							</Text>
						</View>

						<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
								<Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
									Выручка (руб.)
								</Text>
							</View>
							<Text style={{ color: colors.primary, fontSize: 30, fontWeight: 'bold' }}>
								{stats.totalAmount.toFixed(0)}
							</Text>
						</View>
					</View>

					{/* Контрагенты */}
					<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
							<Feather name='users' size={24} color={colors.primary} />
							<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
								Всего контрагентов
							</Text>
						</View>
						<Text style={{ color: colors.primary, fontSize: 36, fontWeight: 'bold' }}>
							{clients.length}
						</Text>
					</View>

					<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
							<Feather name='log-in' size={24} color={colors.primary} />
							<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
								Аккаунт
							</Text>
						</View>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{user?.email}</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default MonitoringScreen
