import { IContractItem, INewContractForm } from '@/shared/types/contracts.types'
import { INewProductForm } from '@/shared/types/products.types'
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
	initialData?: INewContractForm
	onSubmit: (data: INewContractForm) => void
	clients: { id: string; name: string }[]
	products: (INewProductForm & { id: string })[]
}

interface SelectedProduct {
	id: string
	name: string
	price: number
	quantity: number
}

export const ContractForm: FC<Props> = ({
	initialData,
	onSubmit,
	clients,
	products
}) => {
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
			currency: 'RUB',
			items: []
		}
	)

	const [showClientDropdown, setShowClientDropdown] = useState(false)
	const [showProductDropdown, setShowProductDropdown] = useState(false)
	const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
		initialData?.items?.map(item => ({
			id: item.productId,
			name: item.productName,
			price: item.price,
			quantity: item.quantity
		})) || []
	)

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

	const handleProductQuantityChange = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			// Удаляем товар
			setSelectedProducts(prev => prev.filter(p => p.id !== productId))
		} else {
			// Обновляем или добавляем товар
			const existing = selectedProducts.find(p => p.id === productId)
			if (existing) {
				setSelectedProducts(prev =>
					prev.map(p => (p.id === productId ? { ...p, quantity } : p))
				)
			} else {
				const product = products.find(p => p.id === productId)
				if (product) {
					setSelectedProducts(prev => [
						...prev,
						{
							id: productId,
							name: product.name,
							price: product.price,
							quantity
						}
					])
				}
			}
		}
	}

	const handleRemoveProduct = (productId: string) => {
		setSelectedProducts(prev => prev.filter(p => p.id !== productId))
	}

	const handleSubmit = () => {
		if (!formData.clientId || !formData.contractNumber) {
			alert('Заполните обязательные поля')
			return
		}

		// Создаём items из выбранных товаров
		const items: IContractItem[] = selectedProducts.map(p => ({
			productId: p.id,
			productName: p.name,
			price: p.price,
			quantity: p.quantity,
			totalAmount: p.price * p.quantity
		}))

		// Пересчитываем общую сумму если есть товары
		let totalPrice = formData.price
		if (items.length > 0) {
			totalPrice = items.reduce((sum, item) => sum + item.totalAmount, 0)
		}

		onSubmit({
			...formData,
			price: totalPrice,
			items
		})
	}

	const totalProductsPrice = selectedProducts.reduce(
		(sum, p) => sum + p.quantity * p.price,
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
					{initialData ? 'Редактировать акт' : 'Новый акт'}
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

				{/* Products Selection */}
				<View className='mb-4'>
					<Text className='text-gray-300 text-sm font-medium mb-2'>Товары</Text>
					<TouchableOpacity
						onPress={() => setShowProductDropdown(!showProductDropdown)}
						className='bg-gray-default p-3 rounded-lg flex-row items-center justify-between'
					>
						<Text className='text-base text-gray-500'>
							{selectedProducts.length === 0
								? 'Добавить товары'
								: `Товаров: ${selectedProducts.length}`}
						</Text>
						<Feather
							name={showProductDropdown ? 'chevron-up' : 'chevron-down'}
							size={20}
							color='#666'
						/>
					</TouchableOpacity>

					{showProductDropdown && (
						<View className='bg-gray-default mt-1 rounded-lg overflow-hidden max-h-64'>
							<ScrollView nestedScrollEnabled>
								{products.map(product => (
									<View
										key={product.id}
										className='flex-row items-center gap-2 p-3 border-b border-gray-600'
									>
										<View className='flex-1'>
											<Text className='text-white font-medium text-sm'>
												{product.name}
											</Text>
											<Text className='text-gray-400 text-xs'>
												{product.price}₽/шт
											</Text>
										</View>
										<TouchableOpacity
											onPress={() =>
												handleProductQuantityChange(
													product.id,
													(selectedProducts.find(p => p.id === product.id)
														?.quantity || 0) - 1
												)
											}
											className='bg-gray-600 w-6 h-6 rounded items-center justify-center'
										>
											<Text className='text-white text-sm'>−</Text>
										</TouchableOpacity>
										<Text className='text-white font-semibold w-6 text-center text-sm'>
											{selectedProducts.find(p => p.id === product.id)
												?.quantity || 0}
										</Text>
										<TouchableOpacity
											onPress={() =>
												handleProductQuantityChange(
													product.id,
													(selectedProducts.find(p => p.id === product.id)
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
				</View>

				{/* Selected Products Table */}
				{selectedProducts.length > 0 && (
					<View className='mb-4 bg-gray-default rounded-lg p-4'>
						<Text className='text-white font-semibold mb-3'>
							Выбранные товары
						</Text>
						<View className='flex-row pb-2 mb-2 border-b border-gray-600'>
							<Text className='flex-1 text-gray-400 text-xs font-semibold'>
								Товар
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
						{selectedProducts.map(product => (
							<View
								key={product.id}
								className='flex-row items-center pb-2 mb-2 border-b border-gray-700 last:border-b-0 last:mb-0 last:pb-0'
							>
								<Text className='flex-1 text-white text-xs'>
									{product.name}
								</Text>
								<Text className='w-10 text-white text-xs text-center'>
									{product.quantity}
								</Text>
								<Text className='w-14 text-white text-xs text-right'>
									{product.price}₽
								</Text>
								<Text className='w-16 text-primary text-xs text-right font-semibold'>
									{(product.quantity * product.price).toFixed(0)}₽
								</Text>
								<TouchableOpacity
									onPress={() => handleRemoveProduct(product.id)}
									className='w-8 items-center'
								>
									<Feather name='x' size={14} color='#EF4444' />
								</TouchableOpacity>
							</View>
						))}
						<View className='mt-3 pt-3 border-t border-gray-600 flex-row justify-between'>
							<Text className='text-white font-semibold'>Итого товаров:</Text>
							<Text className='text-primary font-bold'>
								{totalProductsPrice.toFixed(0)}₽
							</Text>
						</View>
					</View>
				)}

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
						Сумма договора {selectedProducts.length > 0 ? '(из товаров)' : ''}
					</Text>
					<View className='flex-row gap-2'>
						<TextInput
							className='flex-1 bg-gray-default text-white p-3 rounded-lg'
							placeholder='0'
							placeholderTextColor='#666'
							keyboardType='decimal-pad'
							editable={selectedProducts.length === 0}
							value={
								selectedProducts.length > 0
									? totalProductsPrice.toFixed(0)
									: formData.price.toString()
							}
							onChangeText={val =>
								selectedProducts.length === 0 &&
								handleChange('price', parseFloat(val) || 0)
							}
						/>
						<View className='bg-gray-default p-3 rounded-lg justify-center'>
							<Text className='text-white font-semibold'>
								{formData.currency}
							</Text>
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
