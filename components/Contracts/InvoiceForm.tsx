import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewInvoiceForm } from '@/shared/types/invoice.types'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Props = {
	onSubmit: (data: INewInvoiceForm) => void
	clients: { id: string; name: string; inn: string; address: string }[]
	initialPeriodFrom?: string
	initialPeriodTo?: string
	onPeriodsChange?: (from: string, to: string) => void
	initialClientId?: string
	initialClientName?: string
	initialClientInn?: string
	initialClientAddress?: string
	onClientChange?: (clientId: string, clientName: string, clientInn: string, clientAddress: string) => void
}

export const InvoiceForm: FC<Props> = ({ onSubmit, clients, initialPeriodFrom, initialPeriodTo, onPeriodsChange, initialClientId, initialClientName, initialClientInn, initialClientAddress, onClientChange }) => {
	const { colors } = useTheme()
	const [formData, setFormData] = useState<INewInvoiceForm>({
		clientId: initialClientId || '',
		clientName: initialClientName || '',
		clientInn: initialClientInn || '',
		clientAddress: initialClientAddress || '',
		periodFrom: initialPeriodFrom || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
		periodTo: initialPeriodTo || new Date().toISOString().split('T')[0],
		notes: ''
	})
	const [showClientDropdown, setShowClientDropdown] = useState(false)

	const handleChange = (key: keyof INewInvoiceForm, value: any) => {
		setFormData(prev => ({ ...prev, [key]: value }))
	}

	const handleSelectClient = (clientId: string, clientName: string, inn: string, address: string) => {
		handleChange('clientId', clientId)
		handleChange('clientName', clientName)
		handleChange('clientInn', inn)
		handleChange('clientAddress', address)
		setShowClientDropdown(false)
		onClientChange?.(clientId, clientName, inn, address)
	}

	const handleSubmit = () => {
		if (!formData.clientId || !formData.periodFrom || !formData.periodTo) {
			alert('Выберите контрагента и период'); return
		}
		if (new Date(formData.periodFrom) > new Date(formData.periodTo)) {
			alert('Дата начала не может быть позже даты конца'); return
		}
		onPeriodsChange?.(formData.periodFrom, formData.periodTo)
		onSubmit(formData)
	}

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
			<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>

				{/* Контрагент */}
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Контрагент *</Text>
					<TouchableOpacity
						onPress={() => setShowClientDropdown(!showClientDropdown)}
						style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
					>
						<Text style={{ fontSize: 16, color: formData.clientName ? colors.text : colors.textSecondary }}>
							{formData.clientName || 'Выберите контрагента'}
						</Text>
						<Feather name={showClientDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
					</TouchableOpacity>
					{showClientDropdown && (
						<View style={{ backgroundColor: colors.surface, marginTop: 4, borderRadius: 8, overflow: 'hidden' }}>
							{clients.map(client => (
								<TouchableOpacity
									key={client.id}
									onPress={() => handleSelectClient(client.id, client.name, client.inn, client.address)}
									style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
								>
									<Text style={{ color: colors.text, fontWeight: '500' }}>{client.name}</Text>
									<Text style={{ color: colors.textSecondary, fontSize: 12 }}>ИНН: {client.inn}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Период с */}
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Период с *</Text>
					<TextInput
						style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
						placeholder='2026-01-01'
						placeholderTextColor={colors.textSecondary}
						value={formData.periodFrom}
						onChangeText={val => handleChange('periodFrom', val)}
					/>
				</View>

				{/* Период по */}
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Период по *</Text>
					<TextInput
						style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
						placeholder='2026-01-31'
						placeholderTextColor={colors.textSecondary}
						value={formData.periodTo}
						onChangeText={val => handleChange('periodTo', val)}
					/>
				</View>

				{/* Примечания */}
				<View style={{ marginBottom: 24 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Примечания</Text>
					<TextInput
						style={{ backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8 }}
						placeholder='Дополнительная информация...'
						placeholderTextColor={colors.textSecondary}
						multiline
						numberOfLines={3}
						value={formData.notes}
						onChangeText={val => handleChange('notes', val)}
					/>
				</View>

				<TouchableOpacity
					onPress={handleSubmit}
					style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
				>
					<Feather name='check' size={20} color='white' />
					<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Создать счет</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
