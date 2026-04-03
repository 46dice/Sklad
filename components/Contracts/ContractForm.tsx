import { INewContractForm } from '@/shared/types/contracts.types'
import { Feather } from '@expo/vector-icons'
import { FC, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Props = {
	initialData?: INewContractForm
	onSubmit: (data: INewContractForm) => void
	clients: Array<{ id: string; name: string }>
}

export const ContractForm: FC<Props> = ({ initialData, onSubmit, clients }) => {
	const [formData, setFormData] = useState<INewContractForm>(
		initialData || {
			clientId: '',
			clientName: '',
			contractNumber: '',
			description: '',
			paymentTerms: 'Оплата в течение 30 дней',
			deliveryTerms: 'Доставка в течение 5 рабочих дней',
			price: 0,
			validFrom: new Date().toISOString().split('T')[0],
			validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
				.toISOString()
				.split('T')[0],
			currency: 'RUB'
		}
	)

	const [showClientDropdown, setShowClientDropdown] = useState(false)

	const handleChange = (key: keyof INewContractForm, value: any) => {
		setFormData(prev => ({
			...prev,
			[key]: value
		}))
	}

	const handleSelectClient = (clientId: string, clientName: string) => {
		handleChange('clientId', clientId)
		handleChange('clientName', clientName)
		setShowClientDropdown(false)
	}

	const handleSubmit = () => {
		if (!formData.clientId || !formData.contractNumber || !formData.price) {
			alert('Заполните обязательные поля')
			return
		}
		onSubmit(formData)
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className='flex-1'
		>
			<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
				<Text className='text-white text-2xl font-bold mb-4'>
					{initialData ? 'Редактировать договор' : 'Новый договор'}
				</Text>

				{/* Contract Number */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Номер договора *
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='2026-001'
						placeholderTextColor='#666'
						value={formData.contractNumber}
						onChangeText={val => handleChange('contractNumber', val)}
					/>
				</View>

				{/* Client Selection */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Клиент *
					</Text>
					<TouchableOpacity
						onPress={() => setShowClientDropdown(!showClientDropdown)}
						className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text
							className={`text-base ${formData.clientName ? 'text-white' : 'text-gray-500'}`}
						>
							{formData.clientName || 'Выберите клиента'}
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
									onPress={() => handleSelectClient(client.id, client.name)}
									className='p-3 border-b border-gray-600'
								>
									<Text className='text-white'>{client.name}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* Description */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Описание
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Дополнительная информация...'
						placeholderTextColor='#666'
						multiline
						numberOfLines={3}
						value={formData.description}
						onChangeText={val => handleChange('description', val)}
					/>
				</View>

				{/* Price */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Сумма договора *
					</Text>
					<View className='flex-row gap-2'>
						<TextInput
							className='flex-1 bg-gray-default text-white p-3 rounded-lg'
							placeholder='0'
							placeholderTextColor='#666'
							keyboardType='decimal-pad'
							value={formData.price.toString()}
							onChangeText={val => handleChange('price', parseFloat(val) || 0)}
						/>
						<View className='bg-gray-default p-3 rounded-lg justify-center'>
							<Text className='text-white font-semibold'>{formData.currency}</Text>
						</View>
					</View>
				</View>

				{/* Payment Terms */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Условия оплаты
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Оплата в течение 30 дней'
						placeholderTextColor='#666'
						value={formData.paymentTerms}
						onChangeText={val => handleChange('paymentTerms', val)}
					/>
				</View>

				{/* Delivery Terms */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Условия доставки
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='Доставка в течение 5 рабочих дней'
						placeholderTextColor='#666'
						value={formData.deliveryTerms}
						onChangeText={val => handleChange('deliveryTerms', val)}
					/>
				</View>

				{/* Valid From */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Действителен с
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='2026-04-03'
						placeholderTextColor='#666'
						value={formData.validFrom}
						onChangeText={val => handleChange('validFrom', val)}
					/>
				</View>

				{/* Valid Until */}
				<View className='mb-6'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>
						Действителен до
					</Text>
					<TextInput
						className='bg-gray-default text-white p-3 rounded-lg'
						placeholder='2027-04-03'
						placeholderTextColor='#666'
						value={formData.validUntil}
						onChangeText={val => handleChange('validUntil', val)}
					/>
				</View>

				{/* Submit Button */}
				<TouchableOpacity
					onPress={handleSubmit}
					className='bg-primary p-4 rounded-lg flex-row items-center justify-center'
				>
					<Feather name='check' size={20} color='white' />
					<Text className='text-white font-bold text-lg ml-2'>
						{initialData ? 'Сохранить' : 'Создать договор'}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
