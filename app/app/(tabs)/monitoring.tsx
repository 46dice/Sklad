import { useClients } from '@/components/Clients/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import { ScrollView, Text, View } from 'react-native'

type Props = {}

const MonitoringScreen: FC<Props> = () => {
	const { user } = useAuth()
	const { clients } = useClients()

	return (
		<ScrollView className='flex-1' contentContainerStyle={{ padding: 16 }}>
			<Text className='text-white text-2xl font-bold mb-6'>Мониторинг</Text>

			<View className='gap-4'>
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
	)
}
export default MonitoringScreen
