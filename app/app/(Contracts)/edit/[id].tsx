import { useClients } from '@/components/Clients/hooks/useClients'
import { ShipmentForm } from '@/components/Contracts/ShipmentForm'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useShipments } from '@/hooks/useShipments'
import { INewShipmentForm } from '@/shared/types/shipment.types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const EditShipmentModal: FC = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { clients, isLoading: clientsLoading } = useClients()
	const { products, isLoading: productsLoading } = useProducts()
	const { shipments, updateShipment } = useShipments()
	const [isProcessing, setIsProcessing] = useState(false)

	const shipment = useMemo(() => {
		return shipments.find(s => s.id === id)
	}, [id, shipments])

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name,
		inn: client.inn || '',
		address: client.actualAddress || client.legalAddress || ''
	}))

	// Преобразуем товары в услуги
	const servicesFromProducts = products.map(product => ({
		id: product.id || '',
		name: product.name,
		price: product.price
	}))

	if (!shipment) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<Text className='text-gray-400'>Акт не найден</Text>
			</View>
		)
	}

	const initialFormData: INewShipmentForm = {
		clientId: shipment.clientId,
		clientName: shipment.clientName,
		clientInn: shipment.clientInn,
		clientAddress: shipment.clientAddress,
		items: shipment.items,
		notes: shipment.notes
	}

	const handleUpdateShipment = async (formData: INewShipmentForm) => {
		setIsProcessing(true)
		try {
			const success = await updateShipment(shipment.id, {
				clientId: formData.clientId,
				clientName: formData.clientName,
				clientInn: formData.clientInn,
				clientAddress: formData.clientAddress,
				items: formData.items,
				totalAmount: formData.items.reduce((sum, item) => sum + item.totalAmount, 0),
				notes: formData.notes
			})

			if (success) {
				router.back()
			}
		} catch (error) {
			console.error('Ошибка при обновлении акта:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || productsLoading || isProcessing) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<ActivityIndicator size='large' color='#3B82F6' />
				<Text className='text-white mt-4'>
					{isProcessing ? 'Сохранение акта...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View className='flex-1 bg-black'>
			<ShipmentForm
				initialData={initialFormData}
				onSubmit={handleUpdateShipment}
				clients={clientsForSelect}
				services={servicesFromProducts}
			/>
		</View>
	)
}

export default EditShipmentModal
