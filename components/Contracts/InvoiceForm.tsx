import { INewInvoiceForm } from '@/shared/types/invoice.types'
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
	onSubmit: (data: INewInvoiceForm) => void
	clients: { id: string; name: string; inn: string; address: string }[]
}

export const InvoiceForm: FC<Props> = ({ onSubmit, clients }) => {
	const [formData, setFormData] = useState<INewInvoiceForm>({
		clientId: '',
		clientName: '',
		clientInn: '',
		clientAddress: '',
		periodFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
		periodTo: new Date().toISOString().split('T')[0],
		notes: ''
	})

	const [showClientDropdown, setShowClientDropdown] = useState(false)

	const handleChange = (key: keyof INewInvoiceForm, value: any) => {
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

	const handleSubmit = () => {
		if (!formData.clientId || !formData.periodFrom || !formData.periodTo) {
			alert('Выберите контрагента и период')
			return
		}

		if (new Date(formData.periodFrom) > new Date(formData.periodTo)) {
			alert('Дата начала не может быть позже даты конца')
			return
		}

		onSubmit(formData)
	}

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
					Новый счет
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

				{/* Period From */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Период с *
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='2026-01-01'
						placeholderTextColor='#666'
						value={formData.periodFrom}
						onChangeText={val => handleChange('periodFrom', val)}
					/>
				</View>

				{/* Period To */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Период по *
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='2026-01-31'
						placeholderTextColor='#666'
						value={formData.periodTo}
						onChangeText={val => handleChange('periodTo', val)}
					/>
				</View>

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
						Создать счет
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
