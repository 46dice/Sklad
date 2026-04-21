import { useClients } from '@/components/Clients/hooks/useClients'
import { InvoiceForm } from '@/components/Contracts/InvoiceForm'
import { useInvoices } from '@/hooks/useInvoices'
import { INewInvoiceForm } from '@/shared/types/invoice.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

const NewInvoiceModal: FC = () => {
	const router = useRouter()
	const { clients, isLoading: clientsLoading } = useClients()
	const { saveInvoice } = useInvoices()
	const [isProcessing, setIsProcessing] = useState(false)

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name,
		inn: client.inn || '',
		address: client.actualAddress || client.legalAddress || ''
	}))

	const handleCreateInvoice = async (formData: INewInvoiceForm) => {
		setIsProcessing(true)
		try {
			const savedInvoice = await saveInvoice(formData)

			if (savedInvoice) {
				router.back()
			}
		} catch (error) {
			console.error('Ошибка при создании счета:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || isProcessing) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<ActivityIndicator size='large' color='#3B82F6' />
				<Text className='text-white mt-4'>
					{isProcessing ? 'Создание счета...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View className='flex-1 bg-black'>
			{/* Header */}
			<View className='flex-row items-center p-4 border-b border-gray-700'>
				<TouchableOpacity onPress={() => router.back()} className='flex-row items-center gap-2'>
					<Feather name='arrow-left' size={24} color='white' />
					<Text className='text-white font-semibold'>Назад</Text>
				</TouchableOpacity>
				<Text className='text-white text-lg font-bold flex-1 ml-4'>
					Новый счет
				</Text>
			</View>

			<InvoiceForm
				onSubmit={handleCreateInvoice}
				clients={clientsForSelect}
			/>
		</View>
	)
}

export default NewInvoiceModal
