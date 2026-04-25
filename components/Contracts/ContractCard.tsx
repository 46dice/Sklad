import { useTheme } from '@/providers/theme/ThemeProvider'
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
		case 'draft': return '#F59E0B'
		case 'active': return '#10B981'
		default: return '#9CA3AF'
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
	const { colors } = useTheme()
	return (
		<TouchableOpacity onPress={onPress}>
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 12 }}>
				<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
					<View style={{ flex: 1 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
							<Feather name='file-text' size={20} color={colors.primary} />
							<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
								{contract.contractNumber}
							</Text>
						</View>
						<Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>{contract.clientName}</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
							Сумма: {contract.terms.price.toLocaleString()} {contract.terms.currency}
						</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
							Действителен до: {new Date(contract.terms.validUntil).toLocaleDateString('ru-RU')}
						</Text>
					</View>
					<View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: getStatusColor(contract.status) + '20' }}>
						<Text style={{ fontSize: 12, fontWeight: '600', color: getStatusColor(contract.status) }}>
							{getStatusLabel(contract.status)}
						</Text>
					</View>
				</View>

				{contract.description && (
					<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }} numberOfLines={2}>
						{contract.description}
					</Text>
				)}

				<View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
					{onEdit && (
						<TouchableOpacity
							onPress={onEdit}
							style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 }}
						>
							<Feather name='edit' size={14} color={colors.primary} />
						</TouchableOpacity>
					)}
					{onDelete && (
						<TouchableOpacity
							onPress={onDelete}
							style={{ backgroundColor: '#ef444420', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 }}
						>
							<Feather name='trash-2' size={14} color='#EF4444' />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</TouchableOpacity>
	)
}
