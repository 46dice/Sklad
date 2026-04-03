import { ContractStatus, IContract } from '@/shared/types/contracts.types'
import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
	contract: IContract
	onPress?: () => void
	onEdit?: () => void
	onDelete?: () => void
}

const getStatusColor = (status: ContractStatus) => {
	switch (status) {
		case 'draft':
			return '#F59E0B'
		case 'active':
			return '#10B981'
		default:
			return '#9CA3AF'
	}
}

const getStatusLabel = (status: ContractStatus) => {
	const labels: Record<ContractStatus, string> = {
		draft: 'Черновик',
		active: 'Активный'
	}
	return labels[status]
}

export const ContractCard: FC<Props> = ({ contract, onPress, onEdit, onDelete }) => {
	return (
		<TouchableOpacity onPress={onPress}>
			<View className='bg-gray-default rounded-lg p-4 mb-3'>
				<View className='flex-row items-start justify-between'>
					<View className='flex-1'>
						<View className='flex-row items-center gap-3 mb-2'>
							<Feather name='file-text' size={20} color='#BF3335' />
							<Text className='text-white font-semibold text-base'>
								{contract.contractNumber}
							</Text>
						</View>
						<Text className='text-gray-400 text-sm mb-1'>{contract.clientName}</Text>
						<Text className='text-gray-500 text-xs'>
							Сумма: {contract.terms.price.toLocaleString()} {contract.terms.currency}
						</Text>
						<Text className='text-gray-500 text-xs'>
							Действителен до: {new Date(contract.terms.validUntil).toLocaleDateString('ru-RU')}
						</Text>
					</View>
					<View
						className='px-3 py-1 rounded-full'
						style={{ backgroundColor: getStatusColor(contract.status) + '20' }}
					>
						<Text
							className='text-xs font-semibold'
							style={{ color: getStatusColor(contract.status) }}
						>
							{getStatusLabel(contract.status)}
						</Text>
					</View>
				</View>

				{contract.description && (
					<Text className='text-gray-400 text-xs mt-2 line-clamp-2'>
						{contract.description}
					</Text>
				)}

				<View className='flex-row justify-end gap-2 mt-3'>
					{onEdit && (
						<TouchableOpacity
							onPress={onEdit}
							className='bg-primary/20 px-3 py-1 rounded'
						>
							<Feather name='edit' size={14} color='#BF3335' />
						</TouchableOpacity>
					)}
					{onDelete && (
						<TouchableOpacity
							onPress={onDelete}
							className='bg-red-500/20 px-3 py-1 rounded'
						>
							<Feather name='trash-2' size={14} color='#EF4444' />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</TouchableOpacity>
	)
}
