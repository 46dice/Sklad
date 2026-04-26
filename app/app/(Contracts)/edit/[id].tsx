import { ShipmentForm } from '@/components/Contracts/ShipmentForm'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useClients } from '@/hooks/useClients'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewShipmentForm } from '@/shared/types/shipment.types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const EditShipmentModal: FC = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { colors } = useTheme()
	const { clients, isLoading: clientsLoading } = useClients()
	const { products, isLoading: productsLoading } = useProducts()
	const { shipments, updateShipment } = useShipments()
	const [isProcessing, setIsProcessing] = useState(false)

	const shipment = useMemo(() => shipments.find(s => s.id === id), [id, shipments])

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name,
		inn: client.inn || '',
		address: client.actualAddress || client.legalAddress || ''
	}))

	const servicesFromProducts = products.map(product => ({
		id: product.id || '',
		name: product.name,
		price: product.price
	}))

	if (!shipment) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ color: colors.textSecondary }}>Акт не найден</Text>
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
			if (success) router.back()
		} catch (error) {
			console.error('Ошибка при обновлении акта:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || productsLoading || isProcessing) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator size='large' color={colors.primary} />
				<Text style={{ color: colors.text, marginTop: 16 }}>
					{isProcessing ? 'Сохранение акта...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
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
