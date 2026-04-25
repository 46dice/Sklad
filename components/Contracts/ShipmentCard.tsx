import { useTheme } from '@/providers/theme/ThemeProvider'
import { IShipment } from '@/shared/types/shipment.types'
import { Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

interface ShipmentCardProps {
	shipment: IShipment
	onPress: () => void
	onEdit: () => void
	onDelete: () => void
	onComplete?: () => void
}

export const ShipmentCard = ({
	shipment,
	onPress,
	onEdit,
	onDelete,
	onComplete
}: ShipmentCardProps) => {
	const { colors } = useTheme()
	const createdDate = new Date(shipment.createdAt).toLocaleDateString('ru-RU')
	const statusLabel = shipment.status === 'completed' ? 'Завершен' : 'Черновик'
	const statusBg = shipment.status === 'completed' ? '#16a34a' : '#ca8a04'

	return (
		<Pressable
			onPress={onPress}
			style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
		>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
				<View style={{ flex: 1 }}>
					<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{shipment.actNumber}</Text>
					<Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{shipment.clientName}</Text>
					<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>ИНН: {shipment.clientInn}</Text>
				</View>
				<View style={{ backgroundColor: statusBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
					<Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{statusLabel}</Text>
				</View>
			</View>

			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Сумма</Text>
					<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
						{shipment.totalAmount.toFixed(0)}₽
					</Text>
				</View>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Услуг</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 18 }}>
						{shipment.items.length}
					</Text>
				</View>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Дата</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{createdDate}</Text>
				</View>
			</View>

			<View style={{ flexDirection: 'row', gap: 8 }}>
				{shipment.status === 'draft' && onComplete && (
					<Pressable
						onPress={onComplete}
						style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}
					>
						<Feather name='check' size={14} color='white' />
						<Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Завершить</Text>
					</Pressable>
				)}
				<Pressable
					onPress={onDelete}
					style={{ flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}
				>
					<Feather name='trash-2' size={14} color='white' />
					<Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Удалить</Text>
				</Pressable>
			</View>
		</Pressable>
	)
}
