import { useTheme } from '@/providers/theme/ThemeProvider'
import { IInvoice } from '@/shared/types/invoice.types'
import { Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

interface InvoiceCardProps {
	invoice: IInvoice
	onPress: () => void
	onDelete: () => void
}

export const InvoiceCard = ({
	invoice,
	onPress,
	onDelete
}: InvoiceCardProps) => {
	const { colors } = useTheme()
	const createdDate = new Date(invoice.createdAt).toLocaleDateString('ru-RU')
	const periodFrom = new Date(invoice.periodFrom).toLocaleDateString('ru-RU')
	const periodTo = new Date(invoice.periodTo).toLocaleDateString('ru-RU')

	return (
		<Pressable
			onPress={onPress}
			style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
		>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
				<View style={{ flex: 1 }}>
					<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{invoice.invoiceNumber}</Text>
					<Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{invoice.clientName}</Text>
					<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>ИНН: {invoice.clientInn}</Text>
				</View>
			</View>

			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Сумма</Text>
					<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
						{invoice.totalAmount.toFixed(0)}₽
					</Text>
				</View>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Услуг</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 18 }}>
						{invoice.totalQuantity}
					</Text>
				</View>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 12 }}>Период</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>{periodFrom} - {periodTo}</Text>
				</View>
			</View>

			<View style={{ flexDirection: 'row', gap: 8 }}>
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
