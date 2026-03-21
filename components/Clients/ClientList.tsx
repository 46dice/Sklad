import { INewClientForm } from '@/shared/types/clients.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'

interface ClientListProps {
	clients: (INewClientForm & { id?: string })[]
	isLoading: boolean
}

export default function ClientList({ clients, isLoading }: ClientListProps) {
	const router = useRouter()

	if (isLoading) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Text className='text-white'>Загрузка клиентов...</Text>
			</View>
		)
	}

	if (clients.length === 0) {
		return (
			<View className='flex-1 items-center justify-center'>
				<Feather name='inbox' size={48} color='#666' />
				<Text className='text-gray-500 mt-4'>Нет клиентов</Text>
				<Text className='text-gray-500 text-sm'>Добавьте первого клиента</Text>
			</View>
		)
	}

	return (
		<FlatList
			data={clients}
			keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
			renderItem={({ item }) => (
				<Pressable 
					onPress={() => router.push(`/app/agent/${item.id}`)}
					className='border-b border-gray-default px-4 py-4 flex-row items-center justify-between'>
					<View className='flex-1'>
						<Text className='text-white font-semibold mb-1'>{item.name}</Text>
						<View className='gap-1'>
							{item.phone && (
								<Text className='text-gray-500 text-sm'>Номер телефона: {item.phone}</Text>
							)}
							{item.inn && (
								<Text className='text-gray-500 text-sm'>ИНН:  {item.inn}</Text>
							)}
							{item.email && (
								<Text className='text-gray-500 text-sm'>{item.email}</Text>
							)}
						</View>
					</View>
					<Feather name='chevron-right' size={20} color='#666' />
				</Pressable>
			)}
			scrollEnabled={true}
			contentContainerStyle={{ flexGrow: 1 }}
		/>
	)
}
