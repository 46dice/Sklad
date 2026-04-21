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
	const createdDate = new Date(invoice.createdAt).toLocaleDateString('ru-RU')
	const periodFrom = new Date(invoice.periodFrom).toLocaleDateString('ru-RU')
	const periodTo = new Date(invoice.periodTo).toLocaleDateString('ru-RU')
	const statusLabel = invoice.status === 'paid' ? 'Оплачен' : invoice.status === 'sent' ? 'Отправлен' : 'Черновик'
	const statusColor = invoice.status === 'paid' ? 'bg-green-600' : invoice.status === 'sent' ? 'bg-blue-600' : 'bg-yellow-600'

	return (
		<Pressable
			onPress={onPress}
			className='bg-gray-default rounded-lg p-4 mb-3 border border-gray-600'
		>
			<View className='flex-row items-start justify-between mb-2'>
				<View className='flex-1'>
					<Text className='text-white font-bold text-base'>{invoice.invoiceNumber}</Text>
					<Text className='text-gray-400 text-sm mt-1'>{invoice.clientName}</Text>
					<Text className='text-gray-500 text-xs mt-1'>ИНН: {invoice.clientInn}</Text>
				</View>
				<View className={`${statusColor} rounded-full px-3 py-1`}>
					<Text className='text-white text-xs font-semibold'>{statusLabel}</Text>
				</View>
			</View>

			<View className='flex-row items-center justify-between mb-3 pt-2 border-t border-gray-600'>
				<View>
					<Text className='text-gray-500 text-xs'>Сумма</Text>
					<Text className='text-primary font-bold text-lg'>
						{invoice.totalAmount.toFixed(0)}₽
					</Text>
				</View>
				<View>
					<Text className='text-gray-500 text-xs'>Услуг</Text>
					<Text className='text-white font-semibold text-lg'>
						{invoice.totalQuantity}
					</Text>
				</View>
				<View>
					<Text className='text-gray-500 text-xs'>Период</Text>
					<Text className='text-white font-semibold text-xs'>{periodFrom} - {periodTo}</Text>
				</View>
			</View>

			<View className='flex-row gap-2'>
				<Pressable
					onPress={onDelete}
					className='flex-1 bg-red-500 rounded-lg py-2 flex-row items-center justify-center gap-1'
				>
					<Feather name='trash-2' size={14} color='white' />
					<Text className='text-white font-semibold text-xs'>Удалить</Text>
				</Pressable>
			</View>
		</Pressable>
	)
}
