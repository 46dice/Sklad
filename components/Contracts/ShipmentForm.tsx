import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewShipmentForm, IShipmentItem } from '@/shared/types/shipment.types'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'

type Props = {
	initialData?: INewShipmentForm
	onSubmit: (data: INewShipmentForm) => void
	onBack?: () => void
	clients: { id: string; name: string; inn: string; address: string }[]
	services: { id: string; name: string; price: number }[]
}

interface SelectedService {
	serviceId: string
	serviceName: string
	quantity: number
	price: number
}

export const ShipmentForm: FC<Props> = ({ initialData, onSubmit, onBack, clients, services }) => {
	const { colors } = useTheme()
	const [formData, setFormData] = useState<INewShipmentForm>(
		initialData || { clientId: '', clientName: '', clientInn: '', clientAddress: '', items: [], notes: '' }
	)
	const [showClientDropdown, setShowClientDropdown] = useState(false)
	const [showServiceDropdown, setShowServiceDropdown] = useState(false)
	const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
		initialData?.items?.map(item => ({
			serviceId: item.serviceId,
			serviceName: item.serviceName,
			quantity: item.quantity,
			price: item.price
		})) || []
	)

	const handleChange = (key: keyof INewShipmentForm, value: any) => {
		setFormData(prev => ({ ...prev, [key]: value }))
	}

	const handleSelectClient = (clientId: string, clientName: string, inn: string, address: string) => {
		handleChange('clientId', clientId)
		handleChange('clientName', clientName)
		handleChange('clientInn', inn)
		handleChange('clientAddress', address)
		setShowClientDropdown(false)
	}

	const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
		if (quantity <= 0) {
			setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId))
		} else {
			const existing = selectedServices.find(s => s.serviceId === serviceId)
			if (existing) {
				setSelectedServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, quantity } : s))
			} else {
				const service = services.find(s => s.id === serviceId)
				if (service) {
					setSelectedServices(prev => [...prev, { serviceId, serviceName: service.name, quantity, price: service.price }])
				}
			}
		}
	}

	const handleRemoveService = (serviceId: string) => {
		setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId))
	}

	const handleSubmit = () => {
		if (!formData.clientId) { alert('Выберите контрагента'); return }
		if (selectedServices.length === 0) { alert('Добавьте услуги.'); return }
		const items: IShipmentItem[] = selectedServices.map(s => ({
			serviceId: s.serviceId,
			serviceName: s.serviceName,
			quantity: s.quantity,
			price: s.price,
			totalAmount: s.price * s.quantity
		}))
		onSubmit({ ...formData, items })
	}

	const totalAmount = selectedServices.reduce((sum, s) => sum + s.quantity * s.price, 0)

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
				{onBack && (
					<TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
						<Feather name='arrow-left' size={24} color={colors.text} />
					</TouchableOpacity>
				)}
				<Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>
					{initialData ? 'Редактировать акт' : 'Новый акт отгрузки'}
				</Text>
			</View>

			<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
				<View style={{ gap: 16 }}>

					{/* Контрагент */}
					<View>
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

					{/* Услуги */}
					<View>
						<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Услуги *</Text>
						{services.length === 0 ? (
							<View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8 }}>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>
									Нет доступных услуг. Сначала добавьте товары в разделе "Товары".
								</Text>
							</View>
						) : (
							<>
								<TouchableOpacity
									onPress={() => setShowServiceDropdown(!showServiceDropdown)}
									style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
								>
									<Text style={{ fontSize: 16, color: colors.textSecondary }}>
										{selectedServices.length === 0 ? 'Добавить услуги' : `Услуг: ${selectedServices.length}`}
									</Text>
									<Feather name={showServiceDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
								</TouchableOpacity>
								{showServiceDropdown && (
									<View style={{ backgroundColor: colors.surface, marginTop: 4, borderRadius: 8, overflow: 'hidden', maxHeight: 256 }}>
										<ScrollView nestedScrollEnabled>
											{services.map(service => (
												<View key={service.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
													<View style={{ flex: 1 }}>
														<Text style={{ color: colors.text, fontWeight: '500', fontSize: 14 }}>{service.name}</Text>
														<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{service.price}₽/шт</Text>
													</View>
													<TouchableOpacity
														onPress={() => handleServiceQuantityChange(service.id, (selectedServices.find(s => s.serviceId === service.id)?.quantity || 0) - 1)}
														style={{ backgroundColor: colors.border, width: 24, height: 24, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}
													>
														<Text style={{ color: colors.text, fontSize: 14 }}>−</Text>
													</TouchableOpacity>
													<Text style={{ color: colors.text, fontWeight: '600', width: 24, textAlign: 'center', fontSize: 14 }}>
														{selectedServices.find(s => s.serviceId === service.id)?.quantity || 0}
													</Text>
													<TouchableOpacity
														onPress={() => handleServiceQuantityChange(service.id, (selectedServices.find(s => s.serviceId === service.id)?.quantity || 0) + 1)}
														style={{ backgroundColor: colors.primary, width: 24, height: 24, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}
													>
														<Text style={{ color: 'white', fontSize: 14 }}>+</Text>
													</TouchableOpacity>
												</View>
											))}
										</ScrollView>
									</View>
								)}
							</>
						)}
					</View>

					{/* Выбранные услуги */}
					{selectedServices.length > 0 && (
						<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
							<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Выбранные услуги</Text>
							<View style={{ flexDirection: 'row', paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<Text style={{ flex: 1, color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>Услуга</Text>
								<Text style={{ width: 40, color: colors.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>Кол</Text>
								<Text style={{ width: 56, color: colors.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'right' }}>Цена</Text>
								<Text style={{ width: 64, color: colors.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'right' }}>Сумма</Text>
								<Text style={{ width: 32 }}></Text>
							</View>
							{selectedServices.map(service => (
								<View key={service.serviceId} style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
									<Text style={{ flex: 1, color: colors.text, fontSize: 12 }}>{service.serviceName}</Text>
									<Text style={{ width: 40, color: colors.text, fontSize: 12, textAlign: 'center' }}>{service.quantity}</Text>
									<Text style={{ width: 56, color: colors.text, fontSize: 12, textAlign: 'right' }}>{service.price}₽</Text>
									<Text style={{ width: 64, color: colors.primary, fontSize: 12, textAlign: 'right', fontWeight: '600' }}>{(service.quantity * service.price).toFixed(0)}₽</Text>
									<TouchableOpacity onPress={() => handleRemoveService(service.serviceId)} style={{ width: 32, alignItems: 'center' }}>
										<Feather name='x' size={14} color={colors.error} />
									</TouchableOpacity>
								</View>
							))}
							<View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ color: colors.text, fontWeight: '600' }}>Итого:</Text>
								<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{totalAmount.toFixed(0)}₽</Text>
							</View>
						</View>
					)}

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

					{/* Кнопка */}
					<TouchableOpacity
						onPress={handleSubmit}
						style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
					>
						<Feather name='check' size={20} color='white' />
						<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>
							{initialData ? 'Сохранить' : 'Создать акт'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
