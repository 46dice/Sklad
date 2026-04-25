import { MovementType, useInventoryMovements } from '@/hooks/useInventoryMovements'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { FC, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

type Props = {
	productId: string
	productName: string
}

const getMovementTypeColor = (type: MovementType) => {
	switch (type) {
		case 'sale': return '#EF4444'
		case 'delivery_out': return '#F59E0B'
		case 'delivery_in': return '#10B981'
		case 'return': return '#3B82F6'
		case 'adjustment': return '#8B5CF6'
		default: return '#9CA3AF'
	}
}

const getMovementTypeLabel = (type: MovementType) => {
	const labels: Record<MovementType, string> = {
		sale: 'Продажа',
		delivery_out: 'Отправка',
		delivery_in: 'Поступление',
		return: 'Возврат',
		adjustment: 'Корректировка'
	}
	return labels[type]
}

const getMovementIcon = (type: MovementType) => {
	switch (type) {
		case 'sale': return 'shopping-cart'
		case 'delivery_out': return 'truck'
		case 'delivery_in': return 'package'
		case 'return': return 'rotate-ccw'
		case 'adjustment': return 'edit'
		default: return 'activity'
	}
}

export const ProductMovements: FC<Props> = ({ productId, productName }) => {
	const { movements, isLoading } = useInventoryMovements()
	const { colors } = useTheme()

	const productMovements = useMemo(() => {
		return movements.filter(m => m.productId === productId).slice(0, 10)
	}, [movements, productId])

	if (isLoading) {
		return (
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
				<Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Загрузка движений...</Text>
			</View>
		)
	}

	if (productMovements.length === 0) {
		return (
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
					<Feather name='activity' size={18} color={colors.primary} />
					<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>Движения товара</Text>
				</View>
				<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Нет движений по данному товару</Text>
			</View>
		)
	}

	return (
		<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
				<Feather name='activity' size={18} color={colors.primary} />
				<Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>
					Движения товара ({productMovements.length})
				</Text>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
				{productMovements.map((movement, idx) => (
					<View
						key={movement.id}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							paddingVertical: 12,
							borderBottomWidth: idx < productMovements.length - 1 ? 1 : 0,
							borderBottomColor: colors.border
						}}
					>
						<View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: getMovementTypeColor(movement.movementType) + '20' }}>
							<Feather
								name={getMovementIcon(movement.movementType) as any}
								size={14}
								color={getMovementTypeColor(movement.movementType)}
							/>
						</View>

						<View style={{ flex: 1, marginLeft: 12 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<Text style={{ color: colors.text, fontWeight: '500', fontSize: 14 }}>
									{getMovementTypeLabel(movement.movementType)}
								</Text>
								<Text style={{ fontSize: 14, fontWeight: 'bold', color: movement.quantity > 0 ? '#10B981' : '#EF4444' }}>
									{movement.quantity > 0 ? '+' : ''}{movement.quantity}
								</Text>
							</View>
							{movement.reason && (
								<Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
									{movement.reason}
								</Text>
							)}
							<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
								{new Date(movement.timestamp).toLocaleString('ru-RU')}
							</Text>
						</View>
					</View>
				))}
			</ScrollView>

			{movements.filter(m => m.productId === productId).length > 10 && (
				<Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
					Показаны последние 10 движений
				</Text>
			)}
		</View>
	)
}
