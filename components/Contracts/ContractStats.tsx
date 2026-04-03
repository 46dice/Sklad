import { useDocuments } from '@/hooks/useDocuments'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
	showViewDetailsButton?: boolean
}

export const ContractStats: FC<Props> = ({ showViewDetailsButton = true }) => {
	const { contracts } = useDocuments()
	const router = useRouter()

	const activeContracts = contracts.filter(c => c.status === 'active')
	const draftContracts = contracts.filter(c => c.status === 'draft')
	const expiringSoon = contracts.filter(c => {
		const now = new Date()
		const validUntil = new Date(c.terms.validUntil)
		const daysLeft = Math.floor(
			(validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		)
		return daysLeft > 0 && daysLeft <= 30
	})

	return (
		<View className='gap-3'>
			{/* Main Stats */}
			<View className='flex-row gap-2 mb-2'>
				<View className='flex-1 bg-gray-default rounded-lg p-4'>
					<View className='flex-row items-center justify-between'>
						<View>
							<Text className='text-gray-400 text-sm'>Всего договоров</Text>
							<Text className='text-white text-2xl font-bold mt-1'>
							{contracts.length}
							</Text>
						</View>
						<Feather name='file-text' size={32} color='#BF3335' />
					</View>
				</View>

				<View className='flex-1 bg-gray-default rounded-lg p-4'>
					<View className='flex-row items-center justify-between'>
						<View>
							<Text className='text-gray-400 text-sm'>Активные</Text>
							<Text className='text-white text-2xl font-bold mt-1'>
								{activeContracts.length}
							</Text>
						</View>
						<Feather name='check-circle' size={32} color='#10B981' />
					</View>
				</View>
			</View>

			{/* Secondary Stats */}
			<View className='flex-row gap-2'>
				<View className='flex-1 bg-gray-default rounded-lg p-4'>
					<View className='flex-row items-center justify-between'>
						<View>
							<Text className='text-gray-400 text-sm'>Черновики</Text>
							<Text className='text-white text-2xl font-bold mt-1'>
								{draftContracts.length}
							</Text>
						</View>
						<Feather name='file' size={32} color='#F59E0B' />
					</View>
				</View>
			</View>

			{/* Expiring Soon Alert */}
			{expiringSoon.length > 0 && (
				<View className='bg-orange-500/20 rounded-lg p-3 border border-orange-500/30 mt-2'>
					<View className='flex-row items-center gap-2'>
						<Feather name='alert-circle' size={18} color='#F59E0B' />
						<View className='flex-1'>
							<Text className='text-orange-400 text-sm font-semibold'>
								{expiringSoon.length} договор(ов) заканчивается
							</Text>
							<Text className='text-orange-300 text-xs mt-1'>
								в течение 30 дней
							</Text>
						</View>
					</View>
				</View>
			)}

			{/* View Details Button */}
			{showViewDetailsButton && (
				<TouchableOpacity
					onPress={() => router.push('/app/(tabs)/documents')}
					className='bg-primary rounded-lg p-3 flex-row items-center justify-center mt-2'
				>
					<Feather name='arrow-right' size={16} color='white' />
					<Text className='text-white font-semibold ml-2'>
						Другие договоры
					</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}
