import { useClients } from '@/components/Clients/hooks/useClients'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useSales } from '@/components/Products/hooks/useSales'
import { useAuth } from '@/hooks/useAuth'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { FC, useCallback, useState } from 'react'
import {
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'

type Props = Record<string, never>

const MonitoringScreen: FC<Props> = () => {
	const router = useRouter()
	const { user } = useAuth()
	const { clients } = useClients()
	const { products } = useProducts()
	const {
		getSalesChartData,
		getPeriodStats,
		filterPeriod,
		setFilterPeriod,
		fetchSales
	} = useSales()

	const [selectProductModalVisible, setSelectProductModalVisible] =
		useState(false)

	// Обновляем мониторинг при возврате на вкладку
	useFocusEffect(
		useCallback(() => {
			fetchSales()
		}, [fetchSales])
	)

	const chartData = getSalesChartData()
	const stats = getPeriodStats()
	const screenWidth = Dimensions.get('window').width
	const screenHeight = Dimensions.get('window').height
	const chartHeight = Math.floor(screenHeight * 0.5)

	const filterButtons = [
		{ label: 'Сегодня', value: 'today' as const },
		{ label: 'Неделя', value: 'week' as const },
		{ label: 'Месяц', value: 'month' as const },
		{ label: 'Год', value: 'year' as const }
	]

	const handleSelectProduct = (product: any) => {
		setSelectProductModalVisible(false)
		router.push({
			pathname: '/app/(QuickSale)/modal',
			params: { product: JSON.stringify(product) }
		})
	}

	return (
		<View className='flex-1'>
			{/* Header with button */}
			<View className='flex-row items-center justify-between px-4 pt-4 pb-2'>
				<Text className='text-white text-2xl font-bold'>Мониторинг</Text>
				<Pressable
					onPress={() => setSelectProductModalVisible(true)}
					className='bg-primary rounded-lg p-3'
				>
					<Feather name='plus' size={24} color='white' />
				</Pressable>
			</View>

			{/* Scrollable content */}
			<ScrollView className='flex-1' contentContainerStyle={{ padding: 16 }}>
				<View className='gap-4'>
					{/* График продаж */}
					<View className='bg-gray-default rounded-lg p-4 overflow-hidden'>
						<Text className='text-white text-lg font-semibold mb-4'>
							Продажи
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

					{/* Статистика продаж */}
					<View className='flex-row gap-3'>
						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Feather name='shopping-cart' size={20} color='#BF3335' />
								<Text className='text-white text-sm font-semibold ml-2'>
									Кол-во
								</Text>
							</View>
							<Text className='text-3xl font-bold text-primary'>
								{stats.totalQuantity}
							</Text>
						</View>

						<View className='flex-1 bg-gray-default rounded-lg p-4'>
							<View className='flex-row items-center mb-2'>
								<Text className='text-white text-sm font-semibold ml-2'>
									Сумма (руб.)
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
								Всего клиентов
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

			{/* Modal for selecting product */}
			{products.length > 0 && (
				<Modal
					visible={selectProductModalVisible}
					transparent={true}
					animationType='slide'
					onRequestClose={() => setSelectProductModalVisible(false)}
				>
					<View className='flex-1 justify-end'>
						<Pressable
							className='flex-1 bg-black/50'
							onPress={() => setSelectProductModalVisible(false)}
						/>

						<View className='bg-black border-1 border-gray-400 rounded-t-2xl p-6 pb-8 max-h-3/4'>
							<View className='flex-row items-center justify-between mb-6'>
								<Text className='text-white text-xl font-bold'>
									Новая продажа
								</Text>
								<Pressable onPress={() => setSelectProductModalVisible(false)}>
									<Feather name='x' size={24} color='white' />
								</Pressable>
							</View>

							<ScrollView showsVerticalScrollIndicator={false}>
								<Text className='text-gray-500 text-sm font-semibold mb-3'>
									Выберите товар для продажи
								</Text>
								<View className='gap-2'>
									{products.map(product => (
										<Pressable
											key={product.id}
											onPress={() => handleSelectProduct(product)}
											className='bg-gray-500 rounded-lg p-4 flex-row items-center justify-between'
										>
											<View className='flex-1'>
												<Text className='text-white font-semibold'>
													{product.name}
												</Text>
												<Text className='text-gray-500 text-xs mt-1'>
													SKU: {product.sku} • В наличии: {product.quantity}
												</Text>
											</View>
											<Text className='text-primary font-bold ml-3'>
												{product.price} ₽
											</Text>
										</Pressable>
									))}
								</View>
							</ScrollView>
						</View>
					</View>
				</Modal>
			)}

</View>
	)
}

export default MonitoringScreen
