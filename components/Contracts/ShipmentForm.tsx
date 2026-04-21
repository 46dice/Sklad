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
	clients: { id: string; name: string; inn: string; address: string }[]
	services: { id: string; name: string; price: number }[]
}

interface SelectedService {
	serviceId: string
	serviceName: string
	quantity: number
	price: number
}

export const ShipmentForm: FC<Props> = ({
	initialData,
	onSubmit,
	clients,
	services
}) => {
	const [formData, setFormData] = useState<INewShipmentForm>(
		initialData || {
			clientId: '',
			clientName: '',
			clientInn: '',
			clientAddress: '',
			items: [],
			notes: ''
		}
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
		setFormData(prev => ({
			...prev,
			[key]: value
		}))
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
				setSelectedServices(prev =>
					prev.map(s => (s.serviceId === serviceId ? { ...s, quantity } : s))
				)
			} else {
				const service = services.find(s => s.id === serviceId)
				if (service) {
					setSelectedServices(prev => [
						...prev,
						{
							serviceId,
							serviceName: service.name,
							quantity,
							price: service.price
						}
					])
				}
			}
		}
	}

	const handleRemoveService = (serviceId: string) => {
		setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId))
	}

	const handleSubmit = () => {
		if (!formData.clientId) {
			alert('Выберите контрагента')
			return
		}
		if (selectedServices.length === 0) {
			alert('Добавьте услуги. Если услуг нет, сначала создайте товары в разделе "Товары".')
			return
		}

		const items: IShipmentItem[] = selectedServices.map(s => ({
			serviceId: s.serviceId,
			serviceName: s.serviceName,
			quantity: s.quantity,
			price: s.price,
			totalAmount: s.price * s.quantity
		}))

		onSubmit({
			...formData,
			items
		})
	}

	const totalAmount = selectedServices.reduce(
		(sum, s) => sum + s.quantity * s.price,
		0
	)

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className='flex-1'
		>
			<ScrollView
				className='flex-1 bg-black'
				contentContainerStyle={{ padding: 16 }}
			>
				<Text className='text-white text-2xl font-bold mb-4'>
					{initialData ? 'Редактировать акт' : 'Новый акт отгрузки'}
				</Text>

				{/* Client Selection */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Контрагент *
					</Text>
					<TouchableOpacity
						onPress={() => setShowClientDropdown(!showClientDropdown)}
						className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text
							className={`text-base ${formData.clientName ? 'text-white' : 'text-gray-500'}`}
						>
							{formData.clientName || 'Выберите контрагента'}
						</Text>
						<Feather
							name={showClientDropdown ? 'chevron-up' : 'chevron-down'}
							size={20}
							color='#666'
						/>
					</TouchableOpacity>

					{showClientDropdown && (
						<View className='bg-gray-default mt-1 rounded-lg overflow-hidden'>
							{clients.map(client => (
								<TouchableOpacity
									key={client.id}
									onPress={() => handleSelectClient(client.id, client.name, client.inn, client.address)}
									className='p-3 border-b border-gray-600'
								>
									<Text className='text-white font-medium'>{client.name}</Text>
									<Text className='text-gray-400 text-xs'>ИНН: {client.inn}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Services Selection */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Услуги *</Text>
					{services.length === 0 ? (
						<View className='bg-gray-default p-3 rounded-lg'>
							<Text className='text-gray-400 text-sm'>
								Нет доступных услуг. Сначала добавьте товары в разделе "Товары".
							</Text>
						</View>
					) : (
						<>
							<TouchableOpacity
								onPress={() => setShowServiceDropdown(!showServiceDropdown)}
								className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
							>
								<Text className='text-base text-gray-500'>
									{selectedServices.length === 0
										? 'Добавить услуги'
										: `Услуг: ${selectedServices.length}`}
								</Text>
								<Feather
									name={showServiceDropdown ? 'chevron-up' : 'chevron-down'}
									size={20}
									color='#666'
								/>
							</TouchableOpacity>

							{showServiceDropdown && (
								<View className='bg-gray-default mt-1 rounded-lg overflow-hidden max-h-64'>
									<ScrollView nestedScrollEnabled>
										{services.map(service => (
											<View
												key={service.id}
												className='flex-row items-center gap-2 p-3 border-b border-gray-600'
											>
												<View className='flex-1'>
													<Text className='text-white font-medium text-sm'>
														{service.name}
													</Text>
													<Text className='text-gray-400 text-xs'>
														{service.price}₽/шт
													</Text>
												</View>
												<TouchableOpacity
													onPress={() =>
														handleServiceQuantityChange(
															service.id,
															(selectedServices.find(s => s.serviceId === service.id)
																?.quantity || 0) - 1
														)
													}
													className='bg-gray-600 w-6 h-6 rounded items-center justify-center'
												>
													<Text className='text-white text-sm'>−</Text>
												</TouchableOpacity>
												<Text className='text-white font-semibold w-6 text-center text-sm'>
													{selectedServices.find(s => s.serviceId === service.id)
														?.quantity || 0}
												</Text>
												<TouchableOpacity
													onPress={() =>
														handleServiceQuantityChange(
															service.id,
															(selectedServices.find(s => s.serviceId === service.id)
																?.quantity || 0) + 1
														)
													}
													className='bg-primary w-6 h-6 rounded items-center justify-center'
												>
													<Text className='text-white text-sm'>+</Text>
												</TouchableOpacity>
											</View>
										))}
									</ScrollView>
								</View>
							)}
						</>
					)}
				</View>

				{/* Selected Services Table */}
				{selectedServices.length > 0 && (
					<View className='mb-4 bg-gray-default rounded-lg p-4'>
						<Text className='text-white font-semibold mb-3'>
							Выбранные услуги
						</Text>
						<View className='flex-row pb-2 mb-2 border-b border-gray-600'>
							<Text className='flex-1 text-gray-400 text-xs font-semibold'>
								Услуга
							</Text>
							<Text className='w-10 text-gray-400 text-xs font-semibold text-center'>
								Кол-во
							</Text>
							<Text className='w-14 text-gray-400 text-xs font-semibold text-right'>
								Цена
							</Text>
							<Text className='w-16 text-gray-400 text-xs font-semibold text-right'>
								Сумма
							</Text>
							<Text className='w-8'></Text>
						</View>
						{selectedServices.map(service => (
							<View
								key={service.serviceId}
								className='flex-row items-center pb-2 mb-2 border-b border-gray-700 last:border-b-0 last:mb-0 last:pb-0'
							>
								<Text className='flex-1 text-white text-xs'>
									{service.serviceName}
								</Text>
								<Text className='w-10 text-white text-xs text-center'>
									{service.quantity}
								</Text>
								<Text className='w-14 text-white text-xs text-right'>
									{service.price}₽
								</Text>
								<Text className='w-16 text-primary text-xs text-right font-semibold'>
									{(service.quantity * service.price).toFixed(0)}₽
								</Text>
								<TouchableOpacity
									onPress={() => handleRemoveService(service.serviceId)}
									className='w-8 items-center'
								>
									<Feather name='x' size={14} color='#EF4444' />
								</TouchableOpacity>
							</View>
						))}
						<View className='mt-3 pt-3 border-t border-gray-600 flex-row justify-between'>
							<Text className='text-white font-semibold'>Итого:</Text>
							<Text className='text-primary font-bold'>
								{totalAmount.toFixed(0)}₽
							</Text>
						</View>
					</View>
				)}

				{/* Notes */}
				<View className='mb-6'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Примечания
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Дополнительная информация...'
						placeholderTextColor='#666'
						multiline
						numberOfLines={3}
						value={formData.notes}
						onChangeText={val => handleChange('notes', val)}
					/>
				</View>

				{/* Submit Button */}
				<TouchableOpacity
					onPress={handleSubmit}
					className='bg-primary p-4 rounded-lg flex-row items-center justify-center'
				>
					<Feather name='check' size={20} color='white' />
					<Text className='text-white font-bold text-lg ml-2'>
						{initialData ? 'Сохранить' : 'Создать акт'}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
