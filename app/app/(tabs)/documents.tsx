import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import { ScrollView, Text, View } from 'react-native'

type Props = {}

const Documents: FC<Props> = () => {
	const documents = [
		{ id: 1, name: 'Счет-фактура', date: '15 марта 2026', status: 'Отправлен' },
		{ id: 2, name: 'Накладная', date: '14 марта 2026', status: 'Черновик' },
		{ id: 3, name: 'Договор', date: '10 марта 2026', status: 'Подписан' }
	]

	return (
		<ScrollView className='flex-1' contentContainerStyle={{ padding: 16 }}>
			<Text className='text-white text-2xl font-bold mb-6'>Документы</Text>

			<View className='gap-3'>
				{documents.length > 0 ? (
					documents.map(doc => (
						<View
							key={doc.id}
							className='bg-gray-default rounded-lg p-4 flex-row items-center'
						>
							<Feather name='file-text' size={24} color='#BF3335' />
							<View className='flex-1 ml-4'>
								<Text className='text-white font-semibold'>{doc.name}</Text>
								<Text className='text-gray-500 text-sm'>{doc.date}</Text>
							</View>
							<View className='bg-primary/10 px-3 py-1 rounded'>
								<Text className='text-primary text-xs font-semibold'>
									{doc.status}
								</Text>
							</View>
						</View>
					))
				) : (
					<View className='items-center justify-center py-12'>
						<Feather name='inbox' size={48} color='#666' />
						<Text className='text-gray-500 mt-4'>Нет документов</Text>
					</View>
				)}
			</View>
		</ScrollView>
	)
}
export default Documents
