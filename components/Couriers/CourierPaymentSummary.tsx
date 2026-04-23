import { useCourierPayments } from '@/hooks/useCourierPayments'
import { useCouriers } from '@/hooks/useCouriers'
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

	const totalAllEarnings = payments.reduce((sum, p) => sum + p.totalEarnings, 0)
	const totalAllDeliveries = payments.reduce((sum, p) => sum + p.completedDeliveries, 0)

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			<Text className='text-white text-2xl font-bold mb-6'>Сводка по зарплатам</Text>

			{isLoading ? (
				<View className='items-center justify-center py-12'>
					<ActivityIndicator size='large' color='#BF3335' />
					<Text className='text-gray-400 mt-4'>Загрузка...</Text>
				</View>
			) : (
				<>
					{/* Общая статистика */}
					<View className='bg-gray-default rounded-lg p-4 mb-6'>
						<View className='flex-row justify-between mb-3'>
							<View>
								<Text className='text-gray-400 text-sm'>Всего выплачено</Text>
								<Text className='text-primary font-bold text-2xl mt-1'>{totalAllEarnings}₽</Text>
							</View>
							<View>
								<Text className='text-gray-400 text-sm'>Доставок выполнено</Text>
								<Text className='text-green-400 font-bold text-2xl mt-1'>{totalAllDeliveries}</Text>
							</View>
						</View>
					</View>

					{/* По курьерам */}
					<Text className='text-white font-bold text-lg mb-3'>По курьерам</Text>
					{couriers.length > 0 ? (
						couriers.map(courier => {
							const summary = getCourierSummary(courier.id)
							return (
								<View key={courier.id} className='bg-gray-default rounded-lg p-4 mb-3'>
									<View className='flex-row items-start justify-between mb-2'>
										<View className='flex-1'>
											<Text className='text-white font-semibold'>{courier.name}</Text>
											<Text className='text-gray-400 text-sm mt-1'>
												Доставок: {summary?.completedDeliveries || 0}
											</Text>
										</View>
										<View className='items-end'>
											<Text className='text-primary font-bold text-lg'>
												{summary?.totalEarnings || 0}₽
											</Text>
											{summary && summary.failedDeliveries > 0 && (
												<Text className='text-red-400 text-xs mt-1'>
													Не доставлено: {summary.failedDeliveries}
												</Text>
											)}
										</View>
									</View>
									{!summary && (
										<Text className='text-gray-500 text-sm'>Нет расчётов</Text>
									)}
								</View>
							)
						})
					) : (
						<View className='items-center justify-center py-12'>
							<Feather name='users' size={48} color='#666' />
							<Text className='text-gray-500 mt-4'>Нет курьеров</Text>
						</View>
					)}
				</>
			)}
		</ScrollView>
	)
}

export default CourierPaymentSummary
