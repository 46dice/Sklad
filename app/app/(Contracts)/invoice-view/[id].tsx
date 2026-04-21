import { useAuth } from '@/hooks/useAuth'
import { useInvoices } from '@/hooks/useInvoices'
import { useShipments } from '@/hooks/useShipments'
import { ISupplierInfo } from '@/shared/types/shipment.types'
import { exportInvoiceToPDF } from '@/shared/utils/invoicePDF'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = Record<string, never>

const InvoiceView: FC<Props> = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { userProfile } = useAuth()
	const { invoices } = useInvoices()
	const { shipments } = useShipments()
	const [isExporting, setIsExporting] = useState(false)

	const invoice = useMemo(() => {
		return invoices.find(i => i.id === id)
	}, [id, invoices])

	const relatedShipments = useMemo(() => {
		if (!invoice) return []
		return shipments.filter(s => invoice.shipmentIds.includes(s.id))
	}, [invoice, shipments])

	// Получаем данные поставщика из профиля пользователя
	const supplierInfo: ISupplierInfo = useMemo(() => {
		const profile = userProfile
		return {
			name: profile?.supplierFullName || 'Поставщик',
			inn: profile?.supplierInn || '',
			address: profile?.supplierAddress || '',
			bankName: profile?.supplierBankName || 'Банк',
			bik: profile?.supplierBik || '',
			accountNumber: profile?.supplierAccountNumber || '',
			correspondentAccount: profile?.supplierCorrespondentAccount || ''
		}
	}, [userProfile])

	if (!invoice) {
		return (
			<View className='flex-1 bg-black'>
				<View className='flex-row items-center p-4 border-b border-gray-700'>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name='arrow-left' size={24} color='white' />
					</TouchableOpacity>
					<Text className='text-white text-lg font-semibold ml-4'>Счет</Text>
				</View>
				<View className='flex-1 items-center justify-center'>
					<Text className='text-gray-400'>Счет не найден</Text>
				</View>
			</View>
		)
	}

	const handleExportPDF = async () => {
		setIsExporting(true)
		try {
			const success = await exportInvoiceToPDF(invoice, relatedShipments, supplierInfo)
			if (!success) {
				alert('Ошибка при экспорте в PDF')
			}
		} catch (error) {
			alert('Ошибка: ' + String(error))
		} finally {
			setIsExporting(false)
		}
	}

	const periodFrom = new Date(invoice.periodFrom).toLocaleDateString('ru-RU')
	const periodTo = new Date(invoice.periodTo).toLocaleDateString('ru-RU')

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			{/* Header */}
			<View className='flex-row items-center justify-between mb-6'>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name='arrow-left' size={24} color='white' />
				</TouchableOpacity>
				<Text className='text-white text-xl font-bold flex-1 ml-4'>
					{invoice.invoiceNumber}
				</Text>
			</View>

			{/* Invoice Info */}
			<View className='bg-gray-default rounded-lg p-4 mb-4 gap-3'>
				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Контрагент</Text>
					<Text className='text-white font-semibold text-base'>{invoice.clientName}</Text>
					<Text className='text-gray-500 text-xs mt-1'>ИНН: {invoice.clientInn}</Text>
				</View>

				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Адрес</Text>
					<Text className='text-white text-sm'>{invoice.clientAddress}</Text>
				</View>

				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Период</Text>
					<Text className='text-white text-sm'>{periodFrom} - {periodTo}</Text>
				</View>

				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Сумма</Text>
					<Text className='text-white font-semibold text-base'>
						{invoice.totalAmount.toFixed(0)} ₽
					</Text>
				</View>

				<View>
					<Text className='text-gray-400 text-sm'>Всего услуг</Text>
					<Text className='text-white font-semibold text-base'>
						{invoice.totalQuantity} шт
					</Text>
				</View>
			</View>

			{/* Services Summary */}
			{invoice.items && invoice.items.length > 0 ? (
				<View className='mb-4'>
					<Text className='text-white text-lg font-bold mb-3'>Услуги в счете</Text>
					<View className='bg-gray-default rounded-lg overflow-hidden'>
						{/* Заголовок таблицы */}
						<View className='flex-row bg-gray-600 p-3 border-b border-gray-500'>
							<View className='flex-1'>
								<Text className='text-white font-semibold text-xs'>Услуга</Text>
							</View>
							<View className='w-16'>
								<Text className='text-white font-semibold text-xs text-right'>Кол-во</Text>
							</View>
							<View className='w-20'>
								<Text className='text-white font-semibold text-xs text-right'>Цена</Text>
							</View>
							<View className='w-20'>
								<Text className='text-white font-semibold text-xs text-right'>Сумма</Text>
							</View>
						</View>

						{/* Строки таблицы */}
						{invoice.items.map((item, idx) => (
							<View key={idx} className='flex-row p-3 border-b border-gray-500'>
								<View className='flex-1'>
									<Text className='text-white text-sm'>{item.serviceName}</Text>
									<Text className='text-gray-500 text-xs'>{item.actNumber}</Text>
								</View>
								<View className='w-16'>
									<Text className='text-gray-300 text-sm text-right'>{item.quantity}</Text>
								</View>
								<View className='w-20'>
									<Text className='text-gray-300 text-sm text-right'>{item.price}₽</Text>
								</View>
								<View className='w-20'>
									<Text className='text-primary text-sm text-right font-semibold'>{item.totalAmount}₽</Text>
								</View>
							</View>
						))}

						{/* Итого */}
						<View className='flex-row p-3 bg-gray-700 border-t border-gray-500'>
							<View className='flex-1' />
							<View className='w-56 flex-row items-center justify-between'>
								<Text className='text-white font-semibold'>Итого:</Text>
								<Text className='text-primary font-bold'>
									{invoice.totalAmount.toFixed(0)}₽
								</Text>
							</View>
						</View>
					</View>
				</View>
			) : (
				<View className='mb-4 bg-gray-default rounded-lg p-4'>
					<Text className='text-gray-400 text-sm'>В счете нет услуг</Text>
				</View>
			)}

			{/* Related Shipments */}
			{relatedShipments.length > 0 && (
				<View className='mb-4'>
					<Text className='text-white text-lg font-bold mb-3'>Приложенные акты ({relatedShipments.length})</Text>
					<View className='gap-2'>
						{relatedShipments.map(shipment => (
							<View key={shipment.id} className='bg-gray-default rounded-lg p-3'>
								<Text className='text-white font-semibold'>{shipment.actNumber}</Text>
								<Text className='text-gray-400 text-xs mt-1'>
									{new Date(shipment.createdAt).toLocaleDateString('ru-RU')} • {shipment.totalAmount}₽
								</Text>
							</View>
						))}
					</View>
				</View>
			)}

			{/* Actions */}
			<View className='gap-3'>
				<TouchableOpacity
					onPress={handleExportPDF}
					disabled={isExporting}
					className={`p-3 rounded-lg flex-row items-center justify-center ${
						isExporting ? 'bg-gray-600' : 'bg-blue-600'
					}`}
				>
					<Feather name='download' size={20} color='white' />
					<Text className='text-white font-bold ml-2'>
						{isExporting ? 'Загрузка...' : 'Скачать PDF со счетом и актами'}
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default InvoiceView
